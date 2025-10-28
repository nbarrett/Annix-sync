import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rfq, RfqStatus } from './entities/rfq.entity';
import { RfqItem, RfqItemType } from './entities/rfq-item.entity';
import { StraightPipeRfq, LengthUnit, QuantityType, ScheduleType } from './entities/straight-pipe-rfq.entity';
import { User } from '../user/entities/user.entity';
import { SteelSpecification } from '../steel-specification/entities/steel-specification.entity';
import { PipeDimension } from '../pipe-dimension/entities/pipe-dimension.entity';
import { NbNpsLookup } from '../nb-nps-lookup/entities/nb-nps-lookup.entity';
import { CreateStraightPipeRfqWithItemDto } from './dto/create-rfq-item.dto';
import { StraightPipeCalculationResultDto, RfqResponseDto } from './dto/rfq-response.dto';

@Injectable()
export class RfqService {
  constructor(
    @InjectRepository(Rfq)
    private rfqRepository: Repository<Rfq>,
    @InjectRepository(RfqItem)
    private rfqItemRepository: Repository<RfqItem>,
    @InjectRepository(StraightPipeRfq)
    private straightPipeRfqRepository: Repository<StraightPipeRfq>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SteelSpecification)
    private steelSpecRepository: Repository<SteelSpecification>,
    @InjectRepository(PipeDimension)
    private pipeDimensionRepository: Repository<PipeDimension>,
    @InjectRepository(NbNpsLookup)
    private nbNpsLookupRepository: Repository<NbNpsLookup>,
  ) {}

  async calculateStraightPipeRequirements(
    dto: CreateStraightPipeRfqWithItemDto['straightPipe'],
  ): Promise<StraightPipeCalculationResultDto> {
    // Find pipe dimensions based on NB and schedule/wall thickness
    let pipeDimension: PipeDimension | null = null;
    let steelSpec: SteelSpecification | null = null;

    // Get steel specification if provided
    if (dto.steelSpecificationId) {
      steelSpec = await this.steelSpecRepository.findOne({
        where: { id: dto.steelSpecificationId },
      });
      if (!steelSpec) {
        throw new NotFoundException(`Steel specification with ID ${dto.steelSpecificationId} not found`);
      }
    }

    // Find pipe dimension based on schedule type
    if (dto.scheduleType === ScheduleType.SCHEDULE && dto.scheduleNumber) {
      pipeDimension = await this.pipeDimensionRepository.findOne({
        where: {
          nominalOutsideDiameter: { nominal_diameter_mm: dto.nominalBoreMm },
          schedule_designation: dto.scheduleNumber,
          ...(steelSpec && { steelSpecification: { id: steelSpec.id } }),
        },
        relations: ['nominalOutsideDiameter', 'steelSpecification'],
      });
    } else if (dto.scheduleType === ScheduleType.WALL_THICKNESS && dto.wallThicknessMm) {
      pipeDimension = await this.pipeDimensionRepository.findOne({
        where: {
          nominalOutsideDiameter: { nominal_diameter_mm: dto.nominalBoreMm },
          wall_thickness_mm: dto.wallThicknessMm,
          ...(steelSpec && { steelSpecification: { id: steelSpec.id } }),
        },
        relations: ['nominalOutsideDiameter', 'steelSpecification'],
      });
    }

    if (!pipeDimension) {
      throw new NotFoundException(
        `Pipe dimension not found for ${dto.nominalBoreMm}NB with ${
          dto.scheduleType === ScheduleType.SCHEDULE ? `schedule ${dto.scheduleNumber}` : `wall thickness ${dto.wallThicknessMm}mm`
        }`,
      );
    }

    // Get NB-NPS lookup for outside diameter
    const nbNpsLookup = await this.nbNpsLookupRepository.findOne({
      where: { nb_mm: dto.nominalBoreMm },
    });

    if (!nbNpsLookup) {
      throw new NotFoundException(`NB-NPS lookup not found for ${dto.nominalBoreMm}NB`);
    }

    const outsideDiameterMm = nbNpsLookup.outside_diameter_mm;
    const wallThicknessMm = pipeDimension.wall_thickness_mm;

    // Use the mass from database if available, otherwise calculate
    let pipeWeightPerMeter: number;
    if (pipeDimension.mass_kgm && pipeDimension.mass_kgm > 0) {
      // Use the mass from database (already in kg/m)
      pipeWeightPerMeter = pipeDimension.mass_kgm;
    } else {
      // Fallback: Calculate pipe weight per meter using the formula
      // Weight (kg/m) = π × WT × (OD - WT) × Density / 1,000,000
      const steelDensity = 7.85; // kg/dm³ (default for carbon steel)
      pipeWeightPerMeter = 
        Math.PI * wallThicknessMm * (outsideDiameterMm - wallThicknessMm) * steelDensity / 1000;
    }

    // Convert length to meters if needed
    let individualPipeLengthM = dto.individualPipeLength;
    if (dto.lengthUnit === LengthUnit.FEET) {
      individualPipeLengthM = dto.individualPipeLength * 0.3048;
    }

    // Calculate quantities based on type
    let calculatedPipeCount: number;
    let calculatedTotalLengthM: number;

    if (dto.quantityType === QuantityType.TOTAL_LENGTH) {
      let totalLengthM = dto.quantityValue;
      if (dto.lengthUnit === LengthUnit.FEET) {
        totalLengthM = dto.quantityValue * 0.3048;
      }
      calculatedTotalLengthM = totalLengthM;
      calculatedPipeCount = Math.ceil(totalLengthM / individualPipeLengthM);
    } else {
      calculatedPipeCount = dto.quantityValue;
      calculatedTotalLengthM = calculatedPipeCount * individualPipeLengthM;
    }

    const totalPipeWeight = pipeWeightPerMeter * calculatedTotalLengthM;

    // Calculate welding requirements based on the business rules
    // From your handover doc:
    // - Pipes > 2.5m get flange welds (FWP) - 2 welds per pipe
    // - Pipes <= 2.5m get flange welds (FWF) - 2 welds per pipe
    // Each pipe gets flanges on both ends, so 2 flanges per pipe
    const numberOfFlanges = calculatedPipeCount * 2;
    const numberOfFlangeWelds = numberOfFlanges;

    // Calculate weld length - circumference of pipe
    const circumferenceM = (Math.PI * outsideDiameterMm) / 1000;
    const totalFlangeWeldLength = numberOfFlangeWelds * circumferenceM;

    // No butt welds for straight pipes in standard lengths
    const numberOfButtWelds = 0;
    const totalButtWeldLength = 0;

    return {
      outsideDiameterMm,
      wallThicknessMm,
      pipeWeightPerMeter: Math.round(pipeWeightPerMeter * 100) / 100,
      totalPipeWeight: Math.round(totalPipeWeight),
      calculatedPipeCount,
      calculatedTotalLength: Math.round(calculatedTotalLengthM * 100) / 100,
      numberOfFlanges,
      numberOfButtWelds,
      totalButtWeldLength,
      numberOfFlangeWelds,
      totalFlangeWeldLength: Math.round(totalFlangeWeldLength * 100) / 100,
    };
  }

  async createStraightPipeRfq(
    dto: CreateStraightPipeRfqWithItemDto,
    userId: number,
  ): Promise<{ rfq: Rfq; calculation: StraightPipeCalculationResultDto }> {
    // Find user (optional - for when authentication is implemented)
    const user = await this.userRepository.findOne({ where: { id: userId } }).catch(() => null);

    // Calculate requirements first
    const calculation = await this.calculateStraightPipeRequirements(dto.straightPipe);

    // Generate RFQ number
    const rfqCount = await this.rfqRepository.count();
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(rfqCount + 1).padStart(4, '0')}`;

    // Create RFQ
    const rfq = this.rfqRepository.create({
      ...dto.rfq,
      rfqNumber,
      status: dto.rfq.status || RfqStatus.DRAFT,
      totalWeightKg: calculation.totalPipeWeight,
      ...(user && { createdBy: user }),
    });

    const savedRfq: Rfq = await this.rfqRepository.save(rfq);

    // Create RFQ Item
    const rfqItem = this.rfqItemRepository.create({
      lineNumber: 1,
      description: dto.itemDescription,
      itemType: RfqItemType.STRAIGHT_PIPE,
      quantity: calculation.calculatedPipeCount,
      weightPerUnitKg: calculation.pipeWeightPerMeter,
      totalWeightKg: calculation.totalPipeWeight,
      notes: dto.itemNotes,
      rfq: savedRfq,
    });

    const savedRfqItem: RfqItem = await this.rfqItemRepository.save(rfqItem);

    // Create Straight Pipe RFQ with calculated values
    const straightPipeRfq = this.straightPipeRfqRepository.create({
      ...dto.straightPipe,
      rfqItem: savedRfqItem,
      calculatedOdMm: calculation.outsideDiameterMm,
      calculatedWtMm: calculation.wallThicknessMm,
      pipeWeightPerMeterKg: calculation.pipeWeightPerMeter,
      totalPipeWeightKg: calculation.totalPipeWeight,
      calculatedPipeCount: calculation.calculatedPipeCount,
      calculatedTotalLengthM: calculation.calculatedTotalLength,
      numberOfFlanges: calculation.numberOfFlanges,
      numberOfButtWelds: calculation.numberOfButtWelds,
      totalButtWeldLengthM: calculation.totalButtWeldLength,
      numberOfFlangeWelds: calculation.numberOfFlangeWelds,
      totalFlangeWeldLengthM: calculation.totalFlangeWeldLength,
    });

    // Set relationships if provided
    if (dto.straightPipe.steelSpecificationId) {
      const steelSpec = await this.steelSpecRepository.findOne({
        where: { id: dto.straightPipe.steelSpecificationId },
      });
      if (steelSpec) {
        straightPipeRfq.steelSpecification = steelSpec;
      }
    }

    await this.straightPipeRfqRepository.save(straightPipeRfq);

    // Reload RFQ with relations
    const finalRfq = await this.rfqRepository.findOne({
      where: { id: savedRfq.id },
      relations: ['items', 'items.straightPipeDetails'],
    });

    return { rfq: finalRfq!, calculation };
  }

  async findAllRfqs(userId?: number): Promise<RfqResponseDto[]> {
    // For now, ignore userId filtering since created_by_id column doesn't exist
    const rfqs = await this.rfqRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return rfqs.map(rfq => ({
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      projectName: rfq.projectName,
      description: rfq.description,
      customerName: rfq.customerName,
      customerEmail: rfq.customerEmail,
      customerPhone: rfq.customerPhone,
      requiredDate: rfq.requiredDate,
      status: rfq.status,
      notes: rfq.notes,
      totalWeightKg: rfq.totalWeightKg,
      totalCost: rfq.totalCost,
      createdAt: rfq.createdAt,
      updatedAt: rfq.updatedAt,
      itemCount: rfq.items?.length || 0,
    }));
  }

  async findRfqById(id: number): Promise<Rfq> {
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.straightPipeDetails',
        'items.straightPipeDetails.steelSpecification',
      ],
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    return rfq;
  }
}
