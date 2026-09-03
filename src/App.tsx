import React, { useState, useEffect } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { WorkstationDashboard } from './components/WorkstationDashboard';
import { CompanyVaultView } from './components/CompanyVaultView';
import { IntakeWorkspaceView } from './components/IntakeWorkspaceView';
import { ProcessDocumentModal } from './components/ProcessDocumentModal';
import { CreateDocumentModal } from './components/CreateDocumentModal';
import { PhysicalBarcodeScannerModal } from './components/PhysicalBarcodeScannerModal';
import { QuickRouteModal } from './components/QuickRouteModal';
import { EditSentRoutingModal } from './components/EditSentRoutingModal';
import { BottomRoomManagerBar } from './components/BottomRoomManagerBar';
import { LoginPage } from './components/LoginPage';
import { PrintDocketSlipModal } from './components/PrintDocketSlipModal';
import { CitizenPublicTrackingModal } from './components/CitizenPublicTrackingModal';
import { BatchDispatchManifestModal } from './components/BatchDispatchManifestModal';
import { DocumentItem, DocumentTypeOption, CompanyRecord, WorkspaceView, UserAccount, ScannedPdfData, RoutingEvent } from './types';
import { INITIAL_DOCUMENTS, INITIAL_DOCUMENT_TYPES, INITIAL_COMPANIES, USER_ACCOUNTS, GOVERNMENT_ROOMS } from './data/initialData';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { playSound } from './utils/audioFeedback';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('gov_dms_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default to admin or null; let's allow easy testing or initial login
    return USER_ACCOUNTS[0]; // Admin by default so preview works instantly, with full login/logout toggle
  });

  // Primary application state with local persistence
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('gov_dms_documents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DOCUMENTS;
  });

  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>(() => {
    const saved = localStorage.getItem('gov_dms_types');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DOCUMENT_TYPES;
  });

  const [companies, setCompanies] = useState<CompanyRecord[]>(() => {
    const saved = localStorage.getItem('gov_dms_companies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_COMPANIES;
  });

  // Active workspace view: 'room1' (Admin/Manager), 'room2' (Intake), 'room3' (Legal), 'room4' (Archive), 'room5' (Audit/Tax)
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceView>('room1');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals state
  const [selectedDocForProcessing, setSelectedDocForProcessing] = useState<DocumentItem | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false);
  const [quickRouteDoc, setQuickRouteDoc] = useState<DocumentItem | null>(null);
  const [editingSentDoc, setEditingSentDoc] = useState<DocumentItem | null>(null);
  const [selectedDocForPrint, setSelectedDocForPrint] = useState<DocumentItem | null>(null);
  const [isCitizenTrackingModalOpen, setIsCitizenTrackingModalOpen] = useState<boolean>(false);
  const [isBatchManifestModalOpen, setIsBatchManifestModalOpen] = useState<boolean>(false);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to get room title in Kurdish
  const getActiveRoomName = (roomId: string) => {
    const r = GOVERNMENT_ROOMS.find(room => room.id === roomId);
    return r?.nameKu || 'ژووری ١: نوسینگەی بەڕێوەبەری گشتی (ئەدمین)';
  };

  // Persist state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gov_dms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gov_dms_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gov_dms_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('gov_dms_types', JSON.stringify(documentTypes));
  }, [documentTypes]);

  useEffect(() => {
    localStorage.setItem('gov_dms_companies', JSON.stringify(companies));
  }, [companies]);

  // Handle Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.assignedRoomId) {
      setCurrentWorkspace(user.assignedRoomId);
    } else {
      setCurrentWorkspace('room1');
    }
    showToast(`بەخێربێیت ${user.nameKu} (${user.badgeTitleKu})`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gov_dms_user');
    showToast('دەرچوون لە هەژمار بە سەرکەوتوویی ئەنجامدرا', 'info');
  };

  // Handlers for DMS operations

  // 1. Confirm Physical Receipt of a Docket
  const handleConfirmPhysicalReceipt = (docId: string) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'کاروان ع.';
    const authorRoom = getActiveRoomName(currentWorkspace);

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          physicalReceived: true,
          physicalReceivedAt: nowFormatted,
          status: doc.status === 'Pending Receipt' ? 'In Review' : doc.status,
          internalNotes: [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: authorRoom,
              timestamp: nowFormatted,
              text: 'فۆڵدەری کاغەزی و بەڵگەنامە فەرمییەکان بە فیعلی وەرگیران لە ژوور.',
            }
          ]
        };
      }
      return doc;
    }));

    if (selectedDocForProcessing?.id === docId) {
      setSelectedDocForProcessing(prev => prev ? {
        ...prev,
        physicalReceived: true,
        physicalReceivedAt: nowFormatted,
        status: prev.status === 'Pending Receipt' ? 'In Review' : prev.status,
      } : null);
    }

    showToast(`وەرگرتنی فیزیکی دۆسیەی (${docId}) پشتڕاستکرایەوە لە تۆماری سەرەکی.`, 'success');
  };

  // 2. Route Document to another room
  const handleRouteDocument = (
    docId: string, 
    targetRoom: string, 
    notes: string,
    attachedFile?: { fileName: string; fileSize: string; dataUrl?: string; pagesCount?: number; title?: string }
  ) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'کاروان ع.';
    const authorRoom = getActiveRoomName(currentWorkspace);

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newHistory = [
          ...doc.routingHistory,
          {
            id: `rh-${Date.now()}`,
            fromRoom: doc.currentRoom,
            toRoom: targetRoom,
            timestamp: nowFormatted,
            actionBy: authorName,
            remarks: notes || `ئاڕاستەکرا بۆ ${targetRoom}`,
          }
        ];

        const updatedNotes = notes ? [
          ...doc.internalNotes,
          {
            id: `note-${Date.now()}`,
            author: authorName,
            room: authorRoom,
            timestamp: nowFormatted,
            text: `تێبینی ئاڕاستەکردن بۆ ${targetRoom}: ${notes}`,
          }
        ] : doc.internalNotes;

        const updatedPdf = attachedFile ? {
          ...doc.pdfAttachment,
          fileName: attachedFile.fileName,
          fileSize: attachedFile.fileSize,
          fileDataUrl: attachedFile.dataUrl,
          pagesCount: attachedFile.pagesCount || doc.pdfAttachment?.pagesCount || 1,
          titleKu: attachedFile.title || doc.pdfAttachment?.titleKu || `بەڵگەنامەی هاوپێچکراو: ${attachedFile.fileName}`,
          title: attachedFile.fileName,
        } : doc.pdfAttachment;

        return {
          ...doc,
          currentRoom: targetRoom,
          destinationRoom: targetRoom,
          status: 'Routed',
          physicalReceived: false, // Must be received physically in next room
          pdfAttachment: updatedPdf,
          routingHistory: newHistory,
          internalNotes: updatedNotes,
        };
      }
      return doc;
    }));

    showToast(`دۆسیەی ${docId} بە سەرکەوتوویی ئاڕاستەی ${targetRoom} کرا.`, 'info');
  };

  // 3. Mark Document as Completed & Archive
  const handleCompleteDocument = (docId: string, archivalNotes: string) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'کاروان ع.';
    const targetArchiveRoom = 'ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'Completed',
          currentRoom: targetArchiveRoom,
          destinationRoom: targetArchiveRoom,
          internalNotes: [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: getActiveRoomName(currentWorkspace),
              timestamp: nowFormatted,
              text: `تێبینی کۆتایی و ئەرشیف: ${archivalNotes}`,
            }
          ],
          routingHistory: [
            ...doc.routingHistory,
            {
              id: `rh-${Date.now()}`,
              fromRoom: doc.currentRoom,
              toRoom: targetArchiveRoom,
              timestamp: nowFormatted,
              actionBy: authorName,
              remarks: 'مامەڵەکە تەواوبوو، مۆری فەرمی لێدرا و ڕەوانەی ئەرشیفی هەمیشەیی کرا.',
            }
          ]
        };
      }
      return doc;
    }));

    showToast(`دۆسیەی ${docId} بە تەواوکراو تۆمارکرا و ئەرشیفکرا بۆ ژووری ٤!`, 'success');
  };

  // 3b. Edit Sent Document Routing / Correct mistakes (Requirement 3 & user request)
  const handleEditSentRouting = (
    docId: string, 
    newTargetRoom: string, 
    newRemarks: string, 
    updatedFile?: { fileName: string; fileSize: string; dataUrl?: string }
  ) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'کارمەند';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const updatedAttachment = updatedFile ? {
          ...doc.pdfAttachment,
          fileName: updatedFile.fileName,
          fileSize: updatedFile.fileSize,
          fileDataUrl: updatedFile.dataUrl,
          titleKu: `بەڵگەنامەی هاوپێچکراوی نوێ: ${updatedFile.fileName}`,
        } : doc.pdfAttachment;

        const newHistory = [
          ...doc.routingHistory,
          {
            id: `rh-${Date.now()}`,
            fromRoom: doc.currentRoom,
            toRoom: newTargetRoom,
            timestamp: nowFormatted,
            actionBy: authorName,
            remarks: `[دەستکاریکرا و ڕاستکرایەوە]: ئاڕاستەکردنەکە ڕاستکرایەوە بۆ ${newTargetRoom}. هۆکار/تێبینی: ${newRemarks}`,
          }
        ];

        return {
          ...doc,
          currentRoom: newTargetRoom,
          destinationRoom: newTargetRoom,
          status: 'Routed',
          physicalReceived: false,
          pdfAttachment: updatedAttachment,
          routingHistory: newHistory,
          internalNotes: [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: getActiveRoomName(currentWorkspace),
              timestamp: nowFormatted,
              text: `[دەستکاریکردنی ناردن]: بەڵگەنامەکە دووبارە دەستکاری کرا و نێردرایەوە بۆ ${newTargetRoom}. تێبینی: ${newRemarks}`,
            }
          ]
        };
      }
      return doc;
    }));

    showToast(`ناردنی دۆسیەی (${docId}) ڕاستکرایەوە و بە سەرکەوتوویی ئاڕاستەی ${newTargetRoom} کرایەوە.`, 'success');
  };

  // 3c. Assign Archive Document to Company in Room 4 (Requirement 5)
  const handleAssignDocumentToCompany = (docId: string, companyId: string) => {
    const targetCompany = companies.find(c => c.id === companyId);
    if (!targetCompany) return;

    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'ئەفسەری ئەرشیف (ژووری ٤)';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          companyId: companyId,
          status: 'Completed',
          currentRoom: 'ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان',
          destinationRoom: 'ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان',
          internalNotes: [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: 'ژووری ٤: خەزێنەی ئەرشیفی کۆمپانیاکان',
              timestamp: nowFormatted,
              text: `بەڵگەنامە پشکنرا و بە فەرمی لکێندرا بە دۆسیەی کۆمپانیای [${targetCompany.name} - ${targetCompany.legalNameAr || ''}].`,
            }
          ]
        };
      }
      return doc;
    }));

    // Also link a dossier into company record
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const newDossierFile = {
        id: `dos-${Date.now()}`,
        title: `${doc.documentType} - ${doc.citizenNameAr || doc.citizenName}`,
        fileRef: doc.pdfAttachment?.fileName || `${doc.id}.pdf`,
        category: 'Commercial Licenses' as const,
        uploadedDate: new Date().toLocaleDateString('en-CA'),
        fileSize: doc.pdfAttachment?.fileSize || '2.8 MB',
        status: 'Valid' as const,
        summary: doc.pdfAttachment?.summaryText || `دۆسیەی فەرمی پۆلێنکراو بۆ ${doc.citizenNameAr || doc.citizenName}`,
        officialSealNumber: doc.pdfAttachment?.sealNumber || `SEAL-ARCH-2026`,
        authorizedSignatory: doc.pdfAttachment?.signatoryName || 'ئەفسەری ئەرشیف',
      };

      setCompanies(prev => prev.map(c => {
        if (c.id === companyId) {
          return {
            ...c,
            totalDocuments: c.totalDocuments + 1,
            lastActivity: 'ئێستا (لکاندنی بەڵگەنامەی نوێ)',
            dossiers: [newDossierFile, ...c.dossiers],
          };
        }
        return c;
      }));
    }

    showToast(`بەڵگەنامەی (${docId}) بە سەرکەوتوویی بەسترایەوە بە کۆمپانیای ${targetCompany.name}`, 'success');
  };

  // 3d. Attach file directly from barcode scanner (Requirement 1)
  const handleAttachFileFromScanner = (
    docId: string, 
    attachmentData: Partial<ScannedPdfData>, 
    noteText?: string
  ) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'ئەفسەری سکانەر';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          pdfAttachment: {
            ...doc.pdfAttachment,
            ...attachmentData,
            fileName: attachmentData.fileName || doc.pdfAttachment?.fileName || 'scanned-file.pdf',
            fileSize: attachmentData.fileSize || doc.pdfAttachment?.fileSize || '2.4 MB',
          },
          internalNotes: noteText ? [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: getActiveRoomName(currentWorkspace),
              timestamp: nowFormatted,
              text: noteText,
            }
          ] : doc.internalNotes,
        };
      }
      return doc;
    }));

    showToast(`پەڕگەی سکانکراو بە سەرکەوتوویی لکێندرا بە دۆسیەی (${docId})`, 'success');
  };

  // 4. Add Internal Note to document
  const handleAddNote = (docId: string, noteText: string) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'کاروان ع.';
    const authorRoom = getActiveRoomName(currentWorkspace);

    const newNoteObj = {
      id: `note-${Date.now()}`,
      author: authorName,
      room: authorRoom,
      timestamp: nowFormatted,
      text: noteText,
    };

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const updated = {
          ...doc,
          internalNotes: [...doc.internalNotes, newNoteObj],
        };
        if (selectedDocForProcessing?.id === docId) {
          setSelectedDocForProcessing(updated);
        }
        return updated;
      }
      return doc;
    }));

    showToast(`تێبینی نوێ زیادکرا بۆ دۆسیەکە.`, 'info');
  };

  // 5. Create new document
  const handleCreateDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
    showToast(`دۆسیەی نوێ بە ژمارەی ${newDoc.id} بۆ (${newDoc.citizenNameAr || newDoc.citizenName}) دەرکرا.`, 'success');
  };

  // 6. Update document type (Room 25 Intake workspace - with editable support)
  const handleUpdateDocumentType = (docId: string, newType: string) => {
    const nowFormatted = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.nameKu : 'ڕێبوار ک.';

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          documentType: newType,
          intakeClassificationStatus: 'Re-Classified',
          internalNotes: [
            ...doc.internalNotes,
            {
              id: `note-${Date.now()}`,
              author: authorName,
              room: 'ژووری ٢٥: وەرگرتنی ناوەندی',
              timestamp: nowFormatted,
              text: `جۆری مامەڵە نوێکرایەوە بۆ [${newType}].`,
            }
          ]
        };
      }
      return doc;
    }));

    showToast(`جۆری پۆلێنکردنی دۆسیەی ${docId} گۆڕدرا بۆ "${newType}".`, 'success');
  };

  // 7. Add new document type to catalogue
  const handleAddNewDocumentType = (newTypeData: Omit<DocumentTypeOption, 'id'>) => {
    const newTypeObj: DocumentTypeOption = {
      ...newTypeData,
      id: `type-custom-${Date.now()}`,
    };
    setDocumentTypes(prev => [...prev, newTypeObj]);
    showToast(`جۆری مامەڵەی نوێ "${newTypeObj.nameKu || newTypeObj.name}" زیادکرا بۆ کەتەلۆگ!`, 'success');
  };

  // Open processing modal on specific document
  const handleOpenProcessModal = (doc: DocumentItem) => {
    setSelectedDocForProcessing(doc);
    setIsProcessModalOpen(true);
  };

  // Open official print slip / folder cover modal
  const handleOpenPrintSlip = (doc: DocumentItem) => {
    setSelectedDocForPrint(doc);
    playSound('print_click');
  };

  // Batch Courier Dispatch handler
  const handleBatchRoute = (docIds: string[], targetRoom: string, courierName: string, manifestNotes: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('en-CA');
    const officerName = currentUser?.nameKu || 'ئەفسەری بەرپرس';

    setDocuments(prev => prev.map(doc => {
      if (!docIds.includes(doc.id)) return doc;

      const newHistoryEntry: RoutingEvent = {
        id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fromRoom: doc.currentRoom,
        toRoom: targetRoom,
        actionBy: `${officerName} (گەیەنەر: ${courierName})`,
        timestamp,
        remarks: manifestNotes || `گەیاندنی بەکۆمەڵ بە پێی مەنەفێست بەرەو ${targetRoom.split(':')[0]}`
      };

      return {
        ...doc,
        fromRoom: doc.currentRoom,
        currentRoom: targetRoom,
        destinationRoom: targetRoom,
        physicalReceived: false,
        status: 'Pending Receipt',
        lastUpdated: timestamp,
        routingHistory: [...doc.routingHistory, newHistoryEntry]
      };
    }));

    showToast(`مەنەفێستی گەیاندن دەرچوو: (${docIds.length}) دۆسیە بە سەرکەوتوویی ئاراستەی ${targetRoom.split(':')[0]} کران.`);
  };

  // Batch Physical Receipt Confirm handler
  const handleBatchConfirmReceipt = (docIds: string[]) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('en-CA');
    const officerName = currentUser?.nameKu || 'ئەفسەری ژوور';

    setDocuments(prev => prev.map(doc => {
      if (!docIds.includes(doc.id)) return doc;

      const newHistoryEntry: RoutingEvent = {
        id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        fromRoom: doc.fromRoom || doc.currentRoom,
        toRoom: doc.currentRoom,
        actionBy: officerName,
        timestamp,
        remarks: 'پەسەندکردنی وەرگرتنی فیزیکی بەکۆمەڵ لە ڕێگەی مەنەفێستی گەیەنەر'
      };

      return {
        ...doc,
        physicalReceived: true,
        status: 'In Review',
        lastUpdated: timestamp,
        routingHistory: [...doc.routingHistory, newHistoryEntry]
      };
    }));

    showToast(`(${docIds.length}) فۆڵدەری کاغەزی لە مەنەفێستی گەیەنەر بە فەرمی وەرگیران.`);
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Calculate header badge numbers
  const pendingArrivalCount = documents.filter(d => !d.physicalReceived || d.status === 'Pending Receipt').length;
  const activeQueueCount = documents.filter(d => d.physicalReceived && d.status === 'In Review').length;
  const activeRoom = GOVERNMENT_ROOMS.find(r => r.id === currentWorkspace) || GOVERNMENT_ROOMS[0];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* Top Navigation Bar */}
      <TopNavbar
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={setCurrentWorkspace}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        pendingArrivalCount={pendingArrivalCount}
        activeQueueCount={activeQueueCount}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenCitizenTracking={() => setIsCitizenTrackingModalOpen(true)}
        onOpenBatchManifest={() => setIsBatchManifestModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW: Intake Desk & Classification (Room 2 / legacy room25) */}
        {(currentWorkspace === 'room2' || currentWorkspace === 'room25') && (
          <IntakeWorkspaceView
            documents={documents}
            documentTypes={documentTypes}
            onUpdateDocumentType={handleUpdateDocumentType}
            onAddNewDocumentType={handleAddNewDocumentType}
            onRouteDocument={handleRouteDocument}
            onEditSentRouting={(doc) => setEditingSentDoc(doc)}
            onQuickRouteModal={(doc) => setQuickRouteDoc(doc)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onOpenPrintSlip={handleOpenPrintSlip}
            searchQuery={globalSearch}
          />
        )}

        {/* VIEW: Company Vault & Archive Room (Room 4 / legacy room108) */}
        {(currentWorkspace === 'room4' || currentWorkspace === 'room108') && (
          <CompanyVaultView
            companies={companies}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
            documents={documents}
            onSelectDocument={handleOpenProcessModal}
            onAssignDocumentToCompany={handleAssignDocumentToCompany}
          />
        )}

        {/* VIEW: Workstation Dashboard (Room 1 Admin/Manager, Room 3 Legal, Room 5 Audit/Tax, or legacy room104) */}
        {(currentWorkspace === 'room1' || currentWorkspace === 'room3' || currentWorkspace === 'room5' || currentWorkspace === 'room104') && (
          <WorkstationDashboard
            documents={documents}
            onOpenProcessModal={handleOpenProcessModal}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onConfirmPhysicalReceipt={handleConfirmPhysicalReceipt}
            onQuickRouteModal={(doc) => setQuickRouteDoc(doc)}
            onEditSentRouting={(doc) => setEditingSentDoc(doc)}
            onOpenPrintSlip={handleOpenPrintSlip}
            onOpenBatchManifest={() => setIsBatchManifestModalOpen(true)}
            searchQuery={globalSearch}
            currentUser={currentUser}
            activeRoom={activeRoom}
            onSelectRoom={setCurrentWorkspace}
          />
        )}
      </main>

      {/* Bottom Workstations & Room Manager Selector (Requirement 4) */}
      <BottomRoomManagerBar
        currentWorkspace={currentWorkspace}
        currentUser={currentUser}
        onSelectWorkspace={setCurrentWorkspace}
      />

      {/* Action Modal Window (Processing Overlay) */}
      {selectedDocForProcessing && (
        <ProcessDocumentModal
          document={selectedDocForProcessing}
          isOpen={isProcessModalOpen}
          onClose={() => {
            setIsProcessModalOpen(false);
            setSelectedDocForProcessing(null);
          }}
          onRouteDocument={handleRouteDocument}
          onCompleteDocument={handleCompleteDocument}
          onAddNote={handleAddNote}
          onConfirmPhysicalReceipt={handleConfirmPhysicalReceipt}
          onOpenPrintSlip={handleOpenPrintSlip}
        />
      )}

      {/* Create New Document Modal */}
      {isCreateModalOpen && (
        <CreateDocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateDocument={handleCreateDocument}
          documentTypes={documentTypes}
        />
      )}

      {/* Handheld Physical Barcode Scanner Simulator Modal (Requirement 1) */}
      {isBarcodeScannerOpen && (
        <PhysicalBarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          documents={documents}
          onConfirmPhysicalReceipt={handleConfirmPhysicalReceipt}
          onSelectDocument={handleOpenProcessModal}
          onAttachFileToDocument={handleAttachFileFromScanner}
        />
      )}

      {/* Quick Route Modal */}
      <QuickRouteModal
        document={quickRouteDoc}
        isOpen={!!quickRouteDoc}
        onClose={() => setQuickRouteDoc(null)}
        onRouteDocument={handleRouteDocument}
      />

      {/* Edit Sent Routing / Re-routing Modal (Requirement 3 & user request) */}
      <EditSentRoutingModal
        document={editingSentDoc}
        isOpen={!!editingSentDoc}
        onClose={() => setEditingSentDoc(null)}
        onSaveRouting={handleEditSentRouting}
      />

      {/* Print Slip & Official Folder Cover Modal */}
      {selectedDocForPrint && (
        <PrintDocketSlipModal
          document={selectedDocForPrint}
          isOpen={!!selectedDocForPrint}
          onClose={() => setSelectedDocForPrint(null)}
        />
      )}

      {/* Citizen Live Tracking Inquiry Modal */}
      {isCitizenTrackingModalOpen && (
        <CitizenPublicTrackingModal
          isOpen={isCitizenTrackingModalOpen}
          onClose={() => setIsCitizenTrackingModalOpen(false)}
          documents={documents}
          onOpenPrintSlip={handleOpenPrintSlip}
        />
      )}

      {/* Batch Dispatch & Delivery Manifest Modal */}
      {isBatchManifestModalOpen && (
        <BatchDispatchManifestModal
          isOpen={isBatchManifestModalOpen}
          onClose={() => setIsBatchManifestModalOpen(false)}
          documents={documents}
          currentRoom={activeRoom}
          onBatchRoute={handleBatchRoute}
          onBatchConfirmReceipt={handleBatchConfirmReceipt}
        />
      )}

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Footer Branding Bar */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700">سیستەمی چاودێری و گەیاندنی بەڵگەنامە فەرمییەکان • وەشانى حکومەتی ٣.٨</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400" dir="ltr">
            KRG-DMS-NODE-104 • Cryptographic Audit Chain Active
          </div>
        </div>
      </footer>

    </div>
  );
}
