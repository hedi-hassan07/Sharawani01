export type UrgencyTag = 'Normal' | 'VIP';

export type DocumentStatus = 'Pending Receipt' | 'In Review' | 'Routed' | 'Completed';

export type UserRole = 'admin' | 'officer';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  nameKu: string;
  role: UserRole;
  assignedRoomId: string;
  badgeTitle: string;
  badgeTitleKu: string;
  department: string;
  departmentKu: string;
  phoneExtension: string;
  avatarColor: string;
  avatarInitials: string;
}

export interface InternalNote {
  id: string;
  author: string;
  room: string;
  timestamp: string;
  text: string;
}

export interface RoutingHistoryEntry {
  id: string;
  fromRoom: string;
  toRoom: string;
  timestamp: string;
  actionBy: string;
  remarks: string;
}

export type RoutingEvent = RoutingHistoryEntry;

export interface ScannedPdfData {
  fileName: string;
  title: string;
  titleKu?: string;
  referenceNumber: string;
  issueDate: string;
  issuingAuthority: string;
  issuingAuthorityKu?: string;
  signatoryName: string;
  signatoryTitle: string;
  sealNumber: string;
  pagesCount: number;
  summaryText: string;
  summaryTextKu?: string;
  articles: string[];
  articlesKu?: string[];
  securityHash: string;
  fileDataUrl?: string;
  fileSize?: string;
}

export interface DocumentItem {
  id: string;
  barcode: string;
  citizenName: string;
  citizenNameAr?: string;
  citizenId: string;
  dateReceived: string;
  urgency: UrgencyTag;
  fromRoom: string;
  currentRoom: string;
  destinationRoom?: string;
  status: DocumentStatus;
  documentType: string;
  physicalReceived: boolean;
  physicalReceivedAt?: string;
  internalNotes: InternalNote[];
  pdfAttachment: ScannedPdfData;
  routingHistory: RoutingHistoryEntry[];
  companyId?: string;
  intakeClassificationStatus?: 'Classified' | 'Unclassified' | 'Re-Classified';
}

export interface DocumentTypeOption {
  id: string;
  name: string;
  nameKu?: string;
  code: string;
  category: string;
  categoryKu?: string;
  badgeColor: string;
  description: string;
  descriptionKu?: string;
  defaultTargetRoom: string;
  requiresPhysicalSeal: boolean;
  isCustom?: boolean;
}

export interface CompanyDossierFile {
  id: string;
  title: string;
  titleKu?: string;
  fileRef: string;
  category: string;
  uploadedDate: string;
  fileSize: string;
  status: 'Valid' | 'Expired' | 'Archived' | 'Pending Review';
  summary: string;
  summaryKu?: string;
  officialSealNumber: string;
  authorizedSignatory: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  legalNameAr: string;
  registrationNo: string;
  taxId: string;
  status: 'Verified' | 'Under Audit' | 'Suspended' | 'Pending Renewal';
  capital: string;
  establishedDate: string;
  directorate: string;
  representative: string;
  phone: string;
  email: string;
  totalDocuments: number;
  pendingActions: number;
  lastActivity: string;
  dossiers: CompanyDossierFile[];
}

export type WorkspaceView = 'room1' | 'room2' | 'room3' | 'room4' | 'room5' | 'room104' | 'room108' | 'room25' | 'room102' | 'room201';

export interface RoomInfo {
  id: string;
  roomCode: string;
  name: string;
  nameKu: string;
  leadOfficer: string;
  leadOfficerKu: string;
  badge: string;
  badgeKu: string;
  department: string;
  departmentKu: string;
  phoneExtension: string;
  descriptionKu?: string;
  purposeKu?: string;
}
