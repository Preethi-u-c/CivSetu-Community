export type Language = "en" | "kn" | "hi";

export interface TranslationDictionary {
  topBar: {
    login: string;
    register?: string;
    pigrs: string;
    whatsapp: string;
    skipToMain: string;
    screenReader: string;
    english: string;
    kannada: string;
    hindi: string;
    textSize: string;
    toggleTheme: string;
  };
  header: {
    stateGov: string;
    dept: string;
    portalName: string;
    subTitle: string;
  };
  nav: {
    home: string;
    aboutUs: string;
    contactUs: string;
    login: string;
    register?: string;
    services: string;
    announcements: string;
    news: string;
    events: string;
    schemes: string;
    askCivsetu: string;
    complaints: string;
    dashboard: string;
    notifications: string;
    logout: string;
    profile: string;
    adminPortal: string;
    authorityPortal: string;
  };
  buttons: {
    submit: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    track: string;
    viewAll: string;
    back: string;
    close: string;
    search: string;
    filter: string;
    clearFilter: string;
    speak: string;
    listening: string;
    markRead: string;
    markAllRead: string;
    applyNow: string;
    refresh: string;
    download: string;
    print: string;
    reopen: string;
    escalate: string;
    reportComplaint: string;
    askAi: string;
    copy: string;
    copied: string;
    proceed: string;
  };
  forms: {
    fullName: string;
    mobileNumber: string;
    emailAddress: string;
    wardNumber: string;
    streetAddress: string;
    category: string;
    issueTitle: string;
    description: string;
    priority: string;
    location: string;
    landmark: string;
    photoUpload: string;
    submitComplaint: string;
    submitApplication: string;
    notes: string;
    selectWard: string;
    selectCategory: string;
    enterOtp: string;
    sendOtp: string;
    verifyOtp: string;
    loading: string;
    searchPlaceholder: string;
    filterByWard: string;
    filterByCategory: string;
    required: string;
  };
  complaintCategories: {
    water: string;
    electricity: string;
    sanitation: string;
    roads: string;
    drainage: string;
    streetlights: string;
    waste: string;
    publicHealth: string;
    propertyTax: string;
    townPlanning: string;
    other: string;
  };
  errors: {
    requiredField: string;
    invalidMobile: string;
    invalidOtp: string;
    networkError: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
    rateLimited: string;
    micNotSupported: string;
    micPermissionDenied: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markRead: string;
    markAllRead: string;
    unread: string;
    all: string;
    empty: string;
    complaintRegistered: string;
    complaintAccepted: string;
    complaintAssigned: string;
    complaintEscalated: string;
    complaintResolved: string;
    wardNotice: string;
    announcement: string;
    emergencyAlert: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    myProfile: string;
    myComplaints: string;
    myApplications: string;
    notifications: string;
    quickActions: string;
    statsTotal: string;
    statsSubmitted: string;
    statsUnderReview: string;
    statsInProgress: string;
    statsEscalated: string;
    statsResolved: string;
    pending: string;
    approved: string;
    rejected: string;
    completed: string;
    reportComplaint: string;
    trackGrievance: string;
    viewNotices: string;
    askAssistant: string;
  };
  publicContent: {
    noticesTitle: string;
    newsTitle: string;
    eventsTitle: string;
    schemesTitle: string;
    servicesTitle: string;
    emergencyContacts: string;
    talukInfo: string;
    helpline: string;
    wardMapTitle: string;
    officialPortalNotice: string;
  };
  accessibility: {
    skipToMain: string;
    screenReaderToggle: string;
    languageSelect: string;
    increaseFont: string;
    decreaseFont: string;
    resetFont: string;
    toggleTheme: string;
    voiceInputStart: string;
    voiceInputStop: string;
    closeDialog: string;
    breadcrumb: string;
    status: string;
    liveRegion: string;
  };
  voice: {
    startListening: string;
    stopListening: string;
    listening: string;
    speakNow: string;
    notSupported: string;
    permissionDenied: string;
    tryAgain: string;
    dictatedSuccess: string;
  };
  officials: {
    heading: string;
    viewProfile: string;
  };
  services: {
    heading: string;
    members: string;
    citizenServices: string;
    applications: string;
    citySummary: string;
  };
  map: {
    heading: string;
    title: string;
    zoomIn: string;
    zoomOut: string;
    fullscreen: string;
    viewDetails: string;
  };
  relatedLinks: {
    heading: string;
  };
  info: {
    visitors: string;
    whatsNew: string;
    contactUs: string;
    totalVisitors: string;
    uniqueVisitors: string;
    registeredUsers: string;
    lastRegisteredUser: string;
    publishedNotice: string;
    yourIp: string;
    since: string;
    releaseVersion: string;
  };
  policy: {
    websitePolicies: string;
    sitemap: string;
    copyrightPolicy: string;
    hyperlinkingPolicy: string;
    privacyPolicy: string;
    securityPolicy: string;
    termsAndConditions: string;
    help: string;
    disclaimer: string;
    feedback: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  // ===========================================================================
  // ENGLISH (en)
  // ===========================================================================
  en: {
    topBar: {
      login: "Login",
      register: "Register",
      pigrs: "PIGRS number : 1902",
      whatsapp: "Whatsapp No :-",
      skipToMain: "Skip to main content",
      screenReader: "Screen Reader Access",
      english: "English",
      kannada: "ಕನ್ನಡ",
      hindi: "हिंदी",
      textSize: "Text Size",
      toggleTheme: "Toggle Theme",
    },
    header: {
      stateGov: "Government of Karnataka",
      dept: "Urban Development Department",
      portalName: "CivSetu",
      subTitle: "Lakshmeshwar Town Municipal Council",
    },
    nav: {
      home: "Home",
      aboutUs: "About Us",
      contactUs: "Contact Us",
      login: "Login",
      register: "Register",
      services: "Services",
      announcements: "Announcements",
      news: "Town News",
      events: "Events",
      schemes: "Schemes",
      askCivsetu: "Ask CivSetu AI",
      complaints: "Grievances",
      dashboard: "Citizen Dashboard",
      notifications: "Notifications",
      logout: "Sign Out",
      profile: "My Profile",
      adminPortal: "Admin Portal",
      authorityPortal: "Authority Portal",
    },
    buttons: {
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      track: "Track",
      viewAll: "View All",
      back: "Go Back",
      close: "Close",
      search: "Search",
      filter: "Filter",
      clearFilter: "Clear Filter",
      speak: "Speak",
      listening: "Listening...",
      markRead: "Mark as Read",
      markAllRead: "Mark All as Read",
      applyNow: "Apply Now",
      refresh: "Refresh",
      download: "Download",
      print: "Print",
      reopen: "Reopen",
      escalate: "Escalate",
      reportComplaint: "Report Grievance",
      askAi: "Ask CivSetu AI",
      copy: "Copy",
      copied: "Copied!",
      proceed: "Proceed",
    },
    forms: {
      fullName: "Full Name",
      mobileNumber: "Mobile Number",
      emailAddress: "Email Address",
      wardNumber: "Ward Number",
      streetAddress: "Residential Address",
      category: "Category",
      issueTitle: "Issue Title",
      description: "Detailed Description",
      priority: "Priority Level",
      location: "Location",
      landmark: "Landmark",
      photoUpload: "Upload Photo / Evidence",
      submitComplaint: "Submit Grievance",
      submitApplication: "Submit Service Application",
      notes: "Additional Remarks",
      selectWard: "Select Ward",
      selectCategory: "Select Category",
      enterOtp: "Enter 6-Digit OTP",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      loading: "Processing, please wait...",
      searchPlaceholder: "Search by keyword, ward, or reference number...",
      filterByWard: "Filter by Ward",
      filterByCategory: "Filter by Category",
      required: "This field is required",
    },
    complaintCategories: {
      water: "Water Supply & Pipelines",
      electricity: "Electricity & Power Supply",
      sanitation: "Sanitation & Public Cleanliness",
      roads: "Roads & Footpaths",
      drainage: "Drainage & Sewage",
      streetlights: "Streetlights & Lighting",
      waste: "Solid Waste & Garbage Collection",
      publicHealth: "Public Health & Hygiene",
      propertyTax: "Property Tax & Assessment",
      townPlanning: "Town Planning & Building Permissions",
      other: "Other Civic Issues",
    },
    errors: {
      requiredField: "Please fill out this required field.",
      invalidMobile: "Please enter a valid 10-digit mobile number.",
      invalidOtp: "Invalid OTP code. Please check and try again.",
      networkError: "Network connection failed. Please check your internet connection.",
      unauthorized: "You must be logged in to perform this civic action.",
      notFound: "The requested record was not found.",
      serverError: "Municipal service server encountered an error. Please try again shortly.",
      rateLimited: "Too many requests. Please wait a moment before trying again.",
      micNotSupported: "Speech recognition is not supported in this browser. Please use keyboard input.",
      micPermissionDenied: "Microphone access was denied. Please allow microphone permissions in browser settings.",
    },
    notifications: {
      title: "Notification Center",
      subtitle: "Track live grievance updates, municipal orders, and ward alerts",
      markRead: "Mark as Read",
      markAllRead: "Mark All as Read",
      unread: "Unread",
      all: "All Notifications",
      empty: "No notifications received yet.",
      complaintRegistered: "Grievance Registered",
      complaintAccepted: "Grievance Under Review",
      complaintAssigned: "Officer Assigned",
      complaintEscalated: "Grievance Escalated",
      complaintResolved: "Grievance Resolved",
      wardNotice: "Ward Notification",
      announcement: "Municipal Announcement",
      emergencyAlert: "Emergency Civic Alert",
    },
    dashboard: {
      title: "Citizen Workspace",
      subtitle: "Manage your grievances, statutory applications, and ward notices",
      myProfile: "My Profile",
      myComplaints: "My Grievances",
      myApplications: "My Applications",
      notifications: "Notifications",
      quickActions: "Quick Actions",
      statsTotal: "Total Filed",
      statsSubmitted: "Submitted",
      statsUnderReview: "Under Review",
      statsInProgress: "In Progress",
      statsEscalated: "Escalated",
      statsResolved: "Resolved",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
      reportComplaint: "Report Grievance",
      trackGrievance: "Track Grievance",
      viewNotices: "Ward Notices",
      askAssistant: "Ask CivSetu AI",
    },
    publicContent: {
      noticesTitle: "Public Announcements & Ward Notices",
      newsTitle: "Lakshmeshwar Local News & Bulletins",
      eventsTitle: "Municipal Programs, Cultural Events & Festivals",
      schemesTitle: "Karnataka Government Welfare Schemes",
      servicesTitle: "Citizen Statutory Services Directory",
      emergencyContacts: "Emergency & Municipal Helpline Contacts",
      talukInfo: "Lakshmeshwar Taluk Administration",
      helpline: "Toll-Free Grievance Helpline: 1902",
      wardMapTitle: "Interactive Lakshmeshwar Ward Boundary Map",
      officialPortalNotice: "Official e-Governance portal of Lakshmeshwar TMC, Gadag District.",
    },
    accessibility: {
      skipToMain: "Skip to main content",
      screenReaderToggle: "Toggle screen reader optimized layout",
      languageSelect: "Select portal language",
      increaseFont: "Increase text size (A+)",
      decreaseFont: "Decrease text size (A-)",
      resetFont: "Reset default text size (A)",
      toggleTheme: "Toggle high-contrast / dark theme",
      voiceInputStart: "Start voice input",
      voiceInputStop: "Stop voice input",
      closeDialog: "Close dialog",
      breadcrumb: "Breadcrumb navigation",
      status: "System status",
      liveRegion: "Live announcements region",
    },
    voice: {
      startListening: "Click microphone to speak",
      stopListening: "Listening... Click to stop",
      listening: "Listening... Speak clearly into your microphone",
      speakNow: "Speak now in English, Kannada, or Hindi...",
      notSupported: "Speech recognition not supported in this browser.",
      permissionDenied: "Microphone permission denied.",
      tryAgain: "Could not capture audio. Please try speaking again.",
      dictatedSuccess: "Voice input captured successfully.",
    },
    officials: {
      heading: "Key Dignitaries & Officials",
      viewProfile: "View Profile",
    },
    services: {
      heading: "Quick Services",
      members: "Know Your Members",
      citizenServices: "Citizen Services",
      applications: "Applications for various services",
      citySummary: "City Summary",
    },
    map: {
      heading: "Wardwise Google Map",
      title: "Lakshmeshwar Town Municipal Council - Ward Map",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      fullscreen: "Fullscreen",
      viewDetails: "View Details",
    },
    relatedLinks: {
      heading: "Related Links",
    },
    info: {
      visitors: "Visitors",
      whatsNew: "What's New",
      contactUs: "Contact Us",
      totalVisitors: "Total Visitors",
      uniqueVisitors: "Unique Visitors",
      registeredUsers: "Registered Users",
      lastRegisteredUser: "Last Registered User",
      publishedNotice: "Published Notice",
      yourIp: "Your IP",
      since: "Since",
      releaseVersion: "Release Version",
    },
    policy: {
      websitePolicies: "Website Policies",
      sitemap: "Sitemap",
      copyrightPolicy: "Copyright Policy",
      hyperlinkingPolicy: "Hyperlinking Policy",
      privacyPolicy: "Privacy Policy",
      securityPolicy: "Security Policy",
      termsAndConditions: "Terms and Conditions",
      help: "Help",
      disclaimer: "Disclaimer",
      feedback: "Post Back & Suggestions",
    },
  },

  // ===========================================================================
  // KANNADA (kn)
  // ===========================================================================
  kn: {
    topBar: {
      login: "ಪ್ರವೇಶ (Login)",
      register: "ನೋಂದಣಿ (Register)",
      pigrs: "ಪಿ.ಐ.ಜಿ.ಆರ್.ಎಸ್ ಸಂಖ್ಯೆ : 1902",
      whatsapp: "ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ :-",
      skipToMain: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
      screenReader: "ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಪ್ರವೇಶ",
      english: "English",
      kannada: "ಕನ್ನಡ",
      hindi: "हिंदी",
      textSize: "ಅಕ್ಷರದ ಗಾತ್ರ",
      toggleTheme: "ಥೀಮ್ ಬದಲಾಯಿಸಿ",
    },
    header: {
      stateGov: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
      dept: "ನಗರಾಭಿವೃದ್ಧಿ ಇಲಾಖೆ",
      portalName: "ಸಿವ್‌ಸೇತು",
      subTitle: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ",
    },
    nav: {
      home: "ಮುಖಪುಟ",
      aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ",
      contactUs: "ಸಂಪರ್ಕಿಸಿ",
      login: "ಲಾಗಿನ್",
      register: "ನೋಂದಣಿ",
      services: "ಸೇವೆಗಳು",
      announcements: "ಅಧಿಸೂಚನೆಗಳು",
      news: "ಸ್ಥಳೀಯ ಸುದ್ದಿಗಳು",
      events: "ಕಾರ್ಯಕ್ರಮಗಳು",
      schemes: "ಯೋಜನೆಗಳು",
      askCivsetu: "ಸಿವ್‌ಸೇತು AI",
      complaints: "ದೂರುಗಳು",
      dashboard: "ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      notifications: "ಸೂಚನೆಗಳು",
      logout: "ನಿರ್ಗಮಿಸಿ",
      profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      adminPortal: "ಆಡಳಿತ ಪೋರ್ಟಲ್",
      authorityPortal: "ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್",
    },
    buttons: {
      submit: "ಸಲ್ಲಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      save: "ಉಳಿಸಿ",
      edit: "ತಿದ್ದುಪಡಿ",
      delete: "ಅಳಿಸಿ",
      track: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
      viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
      back: "ಹಿಂದಕ್ಕೆ",
      close: "ಮುಚ್ಚಿ",
      search: "ಹುಡುಕಿ",
      filter: "ಫಿಲ್ಟರ್",
      clearFilter: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
      speak: "ಮಾತನಾಡಿ",
      listening: "ಆಲಿಸುತ್ತಿದೆ...",
      markRead: "ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      applyNow: "ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      refresh: "ನವೀಕರಿಸಿ",
      download: "ಡೌನ್‌ಲೋಡ್",
      print: "ಮುದ್ರಿಸಿ",
      reopen: "ಮರುತೆರೆಯಿರಿ",
      escalate: "ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ (Escalate)",
      reportComplaint: "ದೂರು ದಾಖಲಿಸಿ",
      askAi: "AI ಸಹಾಯಕನನ್ನು ಕೇಳಿ",
      copy: "ನಕಲಿಸಿ",
      copied: "ನಕಲಿಸಲಾಗಿದೆ!",
      proceed: "ಮುಂದುವರಿಯಿರಿ",
    },
    forms: {
      fullName: "ಪೂರ್ಣ ಹೆಸರು",
      mobileNumber: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      emailAddress: "ಇಮೇಲ್ ವಿಳಾಸ",
      wardNumber: "ವಾರ್ಡ್ ಸಂಖ್ಯೆ",
      streetAddress: "ವಾಸಸ್ಥಳದ ವಿಳಾಸ",
      category: "ವರ್ಗ",
      issueTitle: "ಸಮಸ್ಯೆಯ ಶೀರ್ಷಿಕೆ",
      description: "ವಿವರವಾದ ವಿವರಣೆ",
      priority: "ಆದ್ಯತೆ",
      location: "ಸ್ಥಳ",
      landmark: "ಗುರುತಿಸಬಹುದಾದ ಸ್ಥಳ (Landmark)",
      photoUpload: "ಭಾವಚಿತ್ರ / ಸಾಕ್ಷ್ಯ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      submitComplaint: "ದೂರು ಸಲ್ಲಿಸಿ",
      submitApplication: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      notes: "ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು",
      selectWard: "ವಾರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ",
      selectCategory: "ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ",
      enterOtp: "6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
      sendOtp: "OTP ಕಳುಹಿಸಿ",
      verifyOtp: "OTP ಪರಿಶೀಲಿಸಿ",
      loading: "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",
      searchPlaceholder: "ಕೀವರ್ಡ್, ವಾರ್ಡ್ ಅಥವಾ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯಿಂದ ಹುಡುಕಿ...",
      filterByWard: "ವಾರ್ಡ್ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ",
      filterByCategory: "ವರ್ಗದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ",
      required: "ಈ ವಿವರವನ್ನು ನಮೂದಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ",
    },
    complaintCategories: {
      water: "ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಪೈಪ್‌ಲೈನ್",
      electricity: "ವಿದ್ಯುತ್ ಮತ್ತು ವಿದ್ಯುತ್ ಸರಬರಾಜು",
      sanitation: "ನೈರ್ಮಲ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸ್ವಚ್ಛತೆ",
      roads: "ರಸ್ತೆಗಳು ಮತ್ತು ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು",
      drainage: "ಚರಂಡಿ ಮತ್ತು ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆ",
      streetlights: "ಬೀದಿ ದೀಪಗಳು",
      waste: "ಘನತ್ಯಾಜ್ಯ ಮತ್ತು ಕಸ ಸಂಗ್ರಹ",
      publicHealth: "ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ",
      propertyTax: "ಆಸ್ತಿ ತೆರಿಗೆ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ",
      townPlanning: "ನಗರ ಯೋಜನೆ ಮತ್ತು ಕಟ್ಟಡ ಅನುಮತಿ",
      other: "ಇತರ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು",
    },
    errors: {
      requiredField: "ದಯವಿಟ್ಟು ಈ ಕಡ್ಡಾಯ ಕಾಲಂ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
      invalidMobile: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      invalidOtp: "ತಪ್ಪಾದ OTP ಕೋಡ್. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      networkError: "ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      unauthorized: "ಈ ನಾಗರಿಕ ಸೇವೆಯನ್ನು ಪಡೆಯಲು ನೀವು ಲಾಗಿನ್ ಆಗಿರಬೇಕು.",
      notFound: "ಕೋರಿದ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.",
      serverError: "ಪುರಸಭೆಯ ಸರ್ವರ್‌ನಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
      rateLimited: "ಹೆಚ್ಚಿನ ವಿನಂತಿಗಳು ಬಂದಿವೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ನಿರೀಕ್ಷಿಸಿ.",
      micNotSupported: "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice input) ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
      micPermissionDenied: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ.",
    },
    notifications: {
      title: "ಸೂಚನಾ ಕೇಂದ್ರ",
      subtitle: "ದೂರು ಸ್ಥಿತಿ ನವೀಕರಣಗಳು, ಪುರಸಭೆಯ ಆದೇಶಗಳು ಮತ್ತು ವಾರ್ಡ್ ಎಚ್ಚರಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      markRead: "ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      unread: "ಓದದಿರುವ ಸೂಚನೆಗಳು",
      all: "ಎಲ್ಲಾ ಸೂಚನೆಗಳು",
      empty: "ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ.",
      complaintRegistered: "ದೂರು ದಾಖಲಾಗಿದೆ",
      complaintAccepted: "ದೂರು ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
      complaintAssigned: "ಅಧಿಕಾರಿಯನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ",
      complaintEscalated: "ದೂರು ಉನ್ನತ ಹಂತಕ್ಕೆ ರವಾನಿಸಲಾಗಿದೆ",
      complaintResolved: "ದೂರು ಪರಿಹರಿಸಲಾಗಿದೆ",
      wardNotice: "ವಾರ್ಡ್ ಸೂಚನೆ",
      announcement: "ಪುರಸಭೆ ಪ್ರಕಟಣೆ",
      emergencyAlert: "ತುರ್ತು ನಾಗರಿಕ ಎಚ್ಚರಿಕೆ",
    },
    dashboard: {
      title: "ನಾಗರಿಕ ಕಾರ್ಯಸ್ಥಳ",
      subtitle: "ನಿಮ್ಮ ದೂರುಗಳು, ಶಾಸನಬದ್ಧ ಅರ್ಜಿಗಳು ಮತ್ತು ವಾರ್ಡ್ ಸೂಚನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
      myProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      myComplaints: "ನನ್ನ ದೂರುಗಳು",
      myApplications: "ನನ್ನ ಅರ್ಜಿಗಳು",
      notifications: "ಸೂಚನೆಗಳು",
      quickActions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
      statsTotal: "ಒಟ್ಟು ದಾಖಲಾದವು",
      statsSubmitted: "ಸಲ್ಲಿಸಲಾಗಿದೆ",
      statsUnderReview: "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
      statsInProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      statsEscalated: "ಮೇಲ್ಮನವಿ ಹಂತದಲ್ಲಿದೆ",
      statsResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      pending: "ಬಾಕಿ ಉಳಿದಿದೆ",
      approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
      rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      reportComplaint: "ದೂರು ದಾಖಲಿಸಿ",
      trackGrievance: "ದೂರು ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ",
      viewNotices: "ವಾರ್ಡ್ ಸೂಚನೆಗಳು",
      askAssistant: "ಸಿವ್‌ಸೇತು AI ಕೇಳಿ",
    },
    publicContent: {
      noticesTitle: "ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ವಾರ್ಡ್ ಸೂಚನೆಗಳು",
      newsTitle: "ಲಕ್ಷ್ಮೇಶ್ವರ ಸ್ಥಳೀಯ ಸಮಾಚಾರ ಮತ್ತು ಸುದ್ದಿ",
      eventsTitle: "ಪುರಸಭೆ ಕಾರ್ಯಕ್ರಮಗಳು, ಸಾಂಸ್ಕೃತಿಕ ಉತ್ಸವಗಳು",
      schemesTitle: "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಾರ್ವಜನಿಕ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು",
      servicesTitle: "ನಾಗರಿಕ ಶಾಸನಬದ್ಧ ಸೇವೆಗಳ ವಿವರಣೆ",
      emergencyContacts: "ತುರ್ತು ಸೇವೆಗಳು ಮತ್ತು ಸಹಾಯವಾಣಿ ಸಂಪರ್ಕಗಳು",
      talukInfo: "ಲಕ್ಷ್ಮೇಶ್ವರ ತಾಲೂಕು ಆಡಳಿತ",
      helpline: "ಉಚಿತ ನಾಗರಿಕ ಸಹಾಯವಾಣಿ: 1902",
      wardMapTitle: "ಲಕ್ಷ್ಮೇಶ್ವರ ವಾರ್ಡ್ ಗಡಿಗಳ ಸಂವಾದಾತ್ಮಕ ನಕ್ಷೆ",
      officialPortalNotice: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಅಧಿಕೃತ ಇ-ಆಡಳಿತ ತಾಣ, ಗದಗ ಜಿಲ್ಲೆ.",
    },
    accessibility: {
      skipToMain: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
      screenReaderToggle: "ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಮೋಡ್ ಬದಲಾಯಿಸಿ",
      languageSelect: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      increaseFont: "ಅಕ್ಷರದ ಗಾತ್ರ ಹೆಚ್ಚಿಸಿ (A+)",
      decreaseFont: "ಅಕ್ಷರದ ಗಾತ್ರ ಕಡಿಮೆಮಾಡಿ (A-)",
      resetFont: "ಮೂಲ ಅಕ್ಷರದ ಗಾತ್ರ (A)",
      toggleTheme: "ಥೀಮ್ ಬದಲಾಯಿಸಿ (ಡಾರ್ಕ್ / ಲೈಟ್)",
      voiceInputStart: "ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ",
      voiceInputStop: "ಧ್ವನಿ ನಮೂದನೆ ನಿಲ್ಲಿಸಿ",
      closeDialog: "ಮುಚ್ಚಿ",
      breadcrumb: "ಪುಟ ಸೂಚಕ ಕೊಂಡಿಗಳು",
      status: "ವ್ಯವಸ್ಥೆಯ ಸ್ಥಿತಿ",
      liveRegion: "ನೇರ ಪ್ರಕಟಣೆಗಳ ವಿಭಾಗ",
    },
    voice: {
      startListening: "ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಕ್ಲಿಕ್ ಮಾಡಿ",
      stopListening: "ಆಲಿಸುತ್ತಿದೆ... ನಿಲ್ಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಮೈಕ್ರೋಫೋನ್‌ನಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ",
      speakNow: "ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಮಾತನಾಡಿ...",
      notSupported: "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
      permissionDenied: "ಮೈಕ್ರೋಫೋನ್ ಪ್ರವೇಶ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.",
      tryAgain: "ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.",
      dictatedSuccess: "ಧ್ವನಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.",
    },
    officials: {
      heading: "ಪ್ರಮುಖ ಗಣ್ಯರು ಮತ್ತು ಅಧಿಕಾರಿಗಳು",
      viewProfile: "ವಿವರ ವೀಕ್ಷಿಸಿ",
    },
    services: {
      heading: "ತ್ವರಿತ ಸೇವೆಗಳು",
      members: "ನಿಮ್ಮ ಸದಸ್ಯರನ್ನು ತಿಳಿಯಿರಿ",
      citizenServices: "ನಾಗರಿಕ ಸೇವೆಗಳು",
      applications: "ವಿವಿಧ ಸೇವೆಗಳ ಅರ್ಜಿಗಳು",
      citySummary: "ನಗರ ಸಾರಾಂಶ",
    },
    map: {
      heading: "ವಾರ್ಡ್‌ವಾರು ಗೂಗಲ್ ನಕ್ಷೆ",
      title: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ - ವಾರ್ಡ್ ನಕ್ಷೆ",
      zoomIn: "ಹಿಗ್ಗಿಸಿ",
      zoomOut: "ಕುಗ್ಗಿಸಿ",
      fullscreen: "ಪೂರ್ಣ ಪರದೆ",
      viewDetails: "ವಿವರಗಳು",
    },
    relatedLinks: {
      heading: "ಸಂಬಂಧಿತ ಕೊಂಡಿಗಳು",
    },
    info: {
      visitors: "ಸಂದರ್ಶಕರು",
      whatsNew: "ಹೊಸದೇನಿದೆ",
      contactUs: "ಸಂಪರ್ಕಿಸಿ",
      totalVisitors: "ಒಟ್ಟು ಸಂದರ್ಶಕರು",
      uniqueVisitors: "ವಿಶಿಷ್ಟ ಸಂದರ್ಶಕರು",
      registeredUsers: "ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು",
      lastRegisteredUser: "ಕೊನೆಯ ಬಳಕೆದಾರರು",
      publishedNotice: "ಪ್ರಕಟಿತ ಸೂಚನೆಗಳು",
      yourIp: "ನಿಮ್ಮ ಐಪಿ",
      since: "ದಿನಾಂಕದಿಂದ",
      releaseVersion: "ಆವೃತ್ತಿ",
    },
    policy: {
      websitePolicies: "ವೆಬ್‌ಸೈಟ್ ನೀತಿಗಳು",
      sitemap: "ಸೈಟ್‌ಮ್ಯಾಪ್",
      copyrightPolicy: "ಕೃತಿಸ್ವಾಮ್ಯ ನೀತಿ",
      hyperlinkingPolicy: "ಹೈಪರ್‌ಲಿಂಕ್ ನೀತಿ",
      privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
      securityPolicy: "ಭದ್ರತಾ ನೀತಿ",
      termsAndConditions: "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
      help: "ಸಹಾಯ",
      disclaimer: "ಹಕ್ಕುತ್ಯಾಗ",
      feedback: "ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ಸಲಹೆಗಳು",
    },
  },

  // ===========================================================================
  // HINDI (hi)
  // ===========================================================================
  hi: {
    topBar: {
      login: "लॉग इन",
      register: "पंजीकरण",
      pigrs: "PIGRS नंबर : 1902",
      whatsapp: "व्हाट्सएप नंबर :-",
      skipToMain: "मुख्य सामग्री पर जाएं",
      screenReader: "स्क्रीन रीडर एक्सेस",
      english: "English",
      kannada: "ಕನ್ನಡ",
      hindi: "हिंदी",
      textSize: "फ़ॉन्ट आकार",
      toggleTheme: "थीम बदलें",
    },
    header: {
      stateGov: "कर्नाटक सरकार",
      dept: "नगर विकास विभाग",
      portalName: "सिवसेतु",
      subTitle: "लक्ष्मेश्वर नगर पालिका परिषद",
    },
    nav: {
      home: "मुखपृष्ठ",
      aboutUs: "हमारे बारे में",
      contactUs: "संपर्क करें",
      login: "लॉग इन",
      register: "पंजीकरण",
      services: "सेवाएं",
      announcements: "घोषणाएं एवं नोटिस",
      news: "स्थानीय समाचार",
      events: "कार्यक्रम",
      schemes: "योजनाएं",
      askCivsetu: "सिवसेतु AI से पूछें",
      complaints: "शिकायत निवारण",
      dashboard: "नागरिक डैशबोर्ड",
      notifications: "अधिसूचनाएं",
      logout: "साइन आउट",
      profile: "मेरी प्रोफ़ाइल",
      adminPortal: "प्रशासन पोर्टल",
      authorityPortal: "अधिकारी पोर्टल",
    },
    buttons: {
      submit: "जमा करें",
      cancel: "रद्द करें",
      save: "सुरक्षित करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      track: "स्थिति जांचें",
      viewAll: "सभी देखें",
      back: "वापस जाएं",
      close: "बंद करें",
      search: "खोजें",
      filter: "फ़िल्टर करें",
      clearFilter: "फ़िल्टर हटाएं",
      speak: "बोलें",
      listening: "सुन रहे हैं...",
      markRead: "पढ़ा हुआ चिह्नित करें",
      markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
      applyNow: "अभी आवेदन करें",
      refresh: "ताज़ा करें",
      download: "डाउनलोड",
      print: "प्रिंट",
      reopen: "पुनः खोलें",
      escalate: "उच्च स्तर पर भेजें (Escalate)",
      reportComplaint: "शिकायत दर्ज करें",
      askAi: "AI सहायक से पूछें",
      copy: "कॉपी करें",
      copied: "कॉपी हो गया!",
      proceed: "आगे बढ़ें",
    },
    forms: {
      fullName: "पूरा नाम",
      mobileNumber: "मोबाइल नंबर",
      emailAddress: "ईमेल पता",
      wardNumber: "वार्ड नंबर",
      streetAddress: "आवासीय पता",
      category: "श्रेणी",
      issueTitle: "समस्या का शीर्षक",
      description: "विस्तृत विवरण",
      priority: "प्राथमिकता",
      location: "स्थान",
      landmark: "पहचान स्थल (Landmark)",
      photoUpload: "फोटो / साक्ष्य अपलोड करें",
      submitComplaint: "शिकायत दर्ज करें",
      submitApplication: "सेवा आवेदन जमा करें",
      notes: "अतिरिक्त टिप्पणी",
      selectWard: "वार्ड चुनें",
      selectCategory: "श्रेणी चुनें",
      enterOtp: "6-अंकों का OTP दर्ज करें",
      sendOtp: "OTP भेजें",
      verifyOtp: "OTP सत्यापित करें",
      loading: "प्रक्रिया जारी है, कृपया प्रतीक्षा करें...",
      searchPlaceholder: "कीवर्ड, वार्ड या संदर्भ संख्या से खोजें...",
      filterByWard: "वार्ड के अनुसार फ़िल्टर करें",
      filterByCategory: "श्रेणी के अनुसार फ़िल्टर करें",
      required: "यह फ़ील्ड अनिवार्य है",
    },
    complaintCategories: {
      water: "जल आपूर्ति एवं पाइपलाइन",
      electricity: "बिजली और विद्युत आपूर्ति",
      sanitation: "स्वच्छता और सार्वजनिक सफाई",
      roads: "सड़कें और फुटपाथ",
      drainage: "जल निकासी और सीवरेज",
      streetlights: "स्ट्रीट लाइट और प्रकाश व्यवस्था",
      waste: "ठोस कचरा और कूड़ा निस्तारण",
      publicHealth: "जन स्वास्थ्य और स्वच्छता",
      propertyTax: "संपत्ति कर एवं मूल्यांकन",
      townPlanning: "नगर नियोजन एवं भवन अनुमति",
      other: "अन्य नागरिक समस्याएं",
    },
    errors: {
      requiredField: "कृपया इस अनिवार्य फ़ील्ड को भरें।",
      invalidMobile: "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।",
      invalidOtp: "अमान्य OTP कोड। कृपया जांचकर पुनः प्रयास करें।",
      networkError: "नेटवर्क कनेक्शन विफल रहा। कृपया इंटरनेट कनेक्शन जांचें।",
      unauthorized: "इस नागरिक सेवा के लिए आपका लॉग इन होना आवश्यक है।",
      notFound: "वांछित रिकॉर्ड नहीं मिला।",
      serverError: "नगर पालिका सर्वर में त्रुटि हुई है। कृपया कुछ देर बाद प्रयास करें।",
      rateLimited: "अत्यधिक अनुरोध। कृपया कुछ समय प्रतीक्षा करें।",
      micNotSupported: "इस ब्राउज़र में वॉयस इनपुट (Speech Recognition) समर्थित नहीं है।",
      micPermissionDenied: "माइक्रोफ़ोन अनुमति अस्वीकृत। ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।",
    },
    notifications: {
      title: "सूचना केंद्र",
      subtitle: "शिकायत स्थिति, नगर पालिका आदेश और वार्ड अलर्ट की वास्तविक जानकारी",
      markRead: "पढ़ा हुआ चिह्नित करें",
      markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
      unread: "अपठित",
      all: "सभी सूचनाएं",
      empty: "कोई नई सूचना नहीं है।",
      complaintRegistered: "शिकायत दर्ज की गई",
      complaintAccepted: "शिकायत समीक्षाधीन है",
      complaintAssigned: "अधिकारी नियुक्त किया गया",
      complaintEscalated: "शिकायत उच्च स्तर पर प्रेषित",
      complaintResolved: "शिकायत का समाधान हो गया",
      wardNotice: "वार्ड सूचना",
      announcement: "नगर पालिका घोषणा",
      emergencyAlert: "आपातकालीन नागरिक चेतावनी",
    },
    dashboard: {
      title: "नागरिक कार्यस्थान",
      subtitle: "अपनी शिकायतों, वैधानिक आवेदनों और वार्ड सूचनाओं का प्रबंधन करें",
      myProfile: "मेरी प्रोफ़ाइल",
      myComplaints: "मेरी शिकायतें",
      myApplications: "मेरे आवेदन",
      notifications: "सूचनाएं",
      quickActions: "त्वरित कार्य",
      statsTotal: "कुल दर्ज",
      statsSubmitted: "जमा की गई",
      statsUnderReview: "समीक्षाधीन",
      statsInProgress: "प्रगति पर",
      statsEscalated: "अग्रेषित",
      statsResolved: "समाधानित",
      pending: "लंबित",
      approved: "स्वीकृत",
      rejected: "अस्वीकृत",
      completed: "पूर्ण",
      reportComplaint: "शिकायत दर्ज करें",
      trackGrievance: "शिकायत ट्रैक करें",
      viewNotices: "वार्ड नोटिस देखें",
      askAssistant: "सिवसेतु AI से पूछें",
    },
    publicContent: {
      noticesTitle: "सार्वजनिक घोषणाएं एवं वार्ड सूचनाएं",
      newsTitle: "लक्ष्मेश्वर स्थानीय समाचार एवं बुलेटिन",
      eventsTitle: "नगर पालिका कार्यक्रम, सांस्कृतिक उत्सव",
      schemesTitle: "कर्नाटक सरकार कल्याणकारी योजनाएं",
      servicesTitle: "नागरिक वैधानिक सेवा निर्देशिका",
      emergencyContacts: "आपातकालीन सेवाएं और हेल्पलाइन नंबर",
      talukInfo: "लक्ष्मेश्वर तालुका प्रशासन",
      helpline: "टोल-फ्री नागरिक हेल्पलाइन: 1902",
      wardMapTitle: "लक्ष्मेश्वर वार्ड सीमाओं का इंटरैक्टिव मानचित्र",
      officialPortalNotice: "लक्ष्मेश्वर नगर पालिका परिषद, गदग जिला का आधिकारिक ई-शासन पोर्टल।",
    },
    accessibility: {
      skipToMain: "मुख्य सामग्री पर जाएं",
      screenReaderToggle: "स्क्रीन रीडर अनुकूलित मोड बदलें",
      languageSelect: "पोर्टल की भाषा चुनें",
      increaseFont: "फ़ॉन्ट बढ़ाएं (A+)",
      decreaseFont: "फ़ॉन्ट घटाएं (A-)",
      resetFont: "सामान्य फ़ॉन्ट (A)",
      toggleTheme: "थीम बदलें (डार्क / लाइट)",
      voiceInputStart: "आवाज से बोलें",
      voiceInputStop: "आवाज इनपुट रोकें",
      closeDialog: "संवाद बंद करें",
      breadcrumb: "नेविगेशन पथ",
      status: "सिस्टम स्थिति",
      liveRegion: "सजीव घोषणा क्षेत्र",
    },
    voice: {
      startListening: "बोलने के लिए माइक पर क्लिक करें",
      stopListening: "सुन रहे हैं... रोकने के लिए क्लिक करें",
      listening: "सुन रहे हैं... कृपया माइक्रोफ़ोन में स्पष्ट बोलें",
      speakNow: "हिंदी, कन्नड़ या अंग्रेजी में बोलें...",
      notSupported: "इस ब्राउज़र में वाक् पहचान (Speech Recognition) समर्थित नहीं है।",
      permissionDenied: "माइक्रोफ़ोन अनुमति नहीं दी गई।",
      tryAgain: "आवाज समझ नहीं आई। कृपया दोबारा बोलें।",
      dictatedSuccess: "आवाज इनपुट सफलतापूर्वक दर्ज हुआ।",
    },
    officials: {
      heading: "प्रमुख गणमान्य व्यक्ति और अधिकारी",
      viewProfile: "प्रोफ़ाइल देखें",
    },
    services: {
      heading: "त्वरित सेवाएं",
      members: "अपने सदस्यों को जानें",
      citizenServices: "नागरिक सेवाएं",
      applications: "विभिन्न सेवाओं के लिए आवेदन",
      citySummary: "शहर का सारांश",
    },
    map: {
      heading: "वार्ड-वार गूगल मानचित्र",
      title: "लक्ष्मेश्वर नगर पालिका परिषद - वार्ड मानचित्र",
      zoomIn: "बड़ा करें",
      zoomOut: "छोटा करें",
      fullscreen: "पूर्ण स्क्रीन",
      viewDetails: "विवरण देखें",
    },
    relatedLinks: {
      heading: "संबंधित लिंक",
    },
    info: {
      visitors: "आगंतुक",
      whatsNew: "नया क्या है",
      contactUs: "संपर्क करें",
      totalVisitors: "कुल आगंतुक",
      uniqueVisitors: "अद्वितीय आगंतुक",
      registeredUsers: "पंजीकृत उपयोगकर्ता",
      lastRegisteredUser: "अंतिम पंजीकृत उपयोगकर्ता",
      publishedNotice: "प्रकाशित सूचनाएं",
      yourIp: "आपका आईपी",
      since: "दिनांक से",
      releaseVersion: "संस्करण",
    },
    policy: {
      websitePolicies: "वेबसाइट नीतियां",
      sitemap: "साइटमैप",
      copyrightPolicy: "कॉपीराइट नीति",
      hyperlinkingPolicy: "हाइपरलिंकिंग नीति",
      privacyPolicy: "गोपनीयता नीति",
      securityPolicy: "सुरक्षा नीति",
      termsAndConditions: "नियम एवं शर्तें",
      help: "सहायता",
      disclaimer: "अस्वीकरण",
      feedback: "प्रतिक्रिया एवं सुझाव",
    },
  },
};
