export type Department =
  | 'AI & ML'
  | 'Computer Science'
  | 'Electronics & ECE'
  | 'Mechanical'
  | 'Robotics';

export type EquipmentCategory =
  | 'Edge AI & Embedded'
  | 'High-Performance Compute'
  | 'Rapid Prototyping'
  | 'Testing & Measurement'
  | 'FPGA & VLSI'
  | 'Autonomous Systems'
  | 'Robotics & Automation'
  | 'IoT & Sensors'
  | 'Fabrication & CNC';

export type EquipmentStatus = 'Available' | 'In Use' | 'Maintenance' | 'Reserved';

export interface BookingSlot {
  id: string;
  requestId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  studentName: string;
  department: Department;
  projectTitle: string;
}

export interface Equipment {
  id: string;
  name: string;
  department: Department;
  labRoom: string;
  category: EquipmentCategory;
  specs: string;
  totalCapacity: number;
  status: EquipmentStatus;
  imageUrl?: string;
  tags: string[];
  slots: BookingSlot[];
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'conflict' | 'resolved';

export interface AccessRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  studentName: string;
  studentEmail: string;
  department: Department;
  projectTitle: string;
  projectRequirements: string;
  projectDeadline: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: RequestStatus;
  isCrossDepartment: boolean;
  facultyRemarks?: string;
  conflictId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SchedulingConflict {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  overlappingSlot: {
    startTime: string;
    endTime: string;
  };
  requestA: AccessRequest;
  requestB: AccessRequest;
  status: 'active' | 'resolved';
  resolution?: AIResolutionPlan;
  createdAt: string;
}

export interface AIResolutionPlan {
  conflictId: string;
  equipmentId: string;
  equipmentName: string;
  priorityRequest: {
    requestId: string;
    studentName: string;
    projectTitle: string;
    allocatedSlot: {
      date: string;
      startTime: string;
      endTime: string;
    };
    rationale: string;
  };
  secondaryRequest: {
    requestId: string;
    studentName: string;
    projectTitle: string;
    proposedAlternative: {
      type: 'shifted_slot' | 'alternative_equipment' | 'remote_queue';
      allocatedSlot?: {
        date: string;
        startTime: string;
        endTime: string;
      };
      alternativeEquipmentId?: string;
      alternativeEquipmentName?: string;
      notes: string;
    };
    rationale: string;
  };
  fairnessJustification: string;
  recommendedPlanSummary: string;
  source: 'gemini' | 'smart-scheduler-fallback';
  modelUsed?: string;
  timestamp: string;
}

export interface EquipmentRecommendation {
  equipmentId: string;
  equipmentName: string;
  department: Department;
  labRoom: string;
  category: EquipmentCategory;
  matchScore: number; // 0-100
  matchReason: string;
  highlightedSpecs: string[];
  suggestedUsage: string;
  alternativeEquipmentId?: string;
  alternativeEquipmentName?: string;
}

export interface AIDiscoveryResult {
  query: string;
  recommendations: EquipmentRecommendation[];
  analysisSummary: string;
  suggestedNextStep: string;
  source: 'gemini' | 'smart-scheduler-fallback';
  modelUsed?: string;
}

export interface DepartmentUsage {
  department: Department;
  totalBookings: number;
  crossDeptSharedCount: number;
  hoursUsed: number;
  percentageOfTotal: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'request_created' | 'conflict_detected' | 'conflict_resolved' | 'request_approved' | 'request_rejected';
  description: string;
  actor: string;
}

export interface AnalyticsSummary {
  overallUtilizationRate: number; // percentage
  totalEquipmentCount: number;
  activeEquipmentCount: number;
  totalBookingsCount: number;
  crossDepartmentBookingsCount: number;
  crossDepartmentRate: number; // percentage
  activeConflictsCount: number;
  resolvedConflictsCount: number;
  departmentUsage: DepartmentUsage[];
  underutilizedEquipment: Array<{
    id: string;
    name: string;
    department: Department;
    labRoom: string;
    utilizationRate: number;
    suggestion: string;
  }>;
  recentAuditLogs: AuditEvent[];
}
