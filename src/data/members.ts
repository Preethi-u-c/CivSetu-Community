export type MemberCategory =
    | "Elected Representatives"
    | "Municipal Administration"
    | "Engineering"
    | "Health"
    | "Revenue"
    | "Administration"
    | "Finance"
    | "Day-NULM"
    | "Legal / Nodal Officers"
    | "Advocates"
    | "Ward Representatives";

export interface Member {
    id: string;
    name: string;
    designation: string;
    category: MemberCategory;
    constituency?: string;
    address?: string;
    phone?: string;
    email?: string;
    photo?: string;
    source: string;
    verified?: boolean;
}

export const membersData: Member[] = [
    {
        id: "elected-1",
        name: "Shri D K Shivakumar",
        designation: "Hon’ble Chief Minister, Government of Karnataka",
        category: "Elected Representatives",
        address: "Room No. 323A, 3rd Floor, Vidhana Soudha, Bengaluru-01",
        phone: "080-22253414",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-2",
        name: "Shri Dr V Satyanarayana Siddaramiya",
        designation:
            "Hon’ble Minister, Urban Development, including Karnataka Urban Water Supply and Drainage Board, KUWSDB, all Urban Development Authorities including Bengaluru Authorities",
        category: "Elected Representatives",
        address: "Room No. 38 & 39, Vidhana Soudha, Bengaluru-01",
        phone: "080-22252292",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-3",
        name: "Shri H.K. Patil",
        designation:
            "Minister of Tourism, Law, Parliamentary Affairs, Legislation and Gadag District Incharge Minister",
        category: "Elected Representatives",
        address: "Hulakoti, Dist: Gadag",
        phone: "9740983448",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-4",
        name: "Dr. Chandru Lamani",
        designation:
            "Member of Legislative Assembly, Shirahatti Constituency",
        category: "Elected Representatives",
        address: "1st Main Road, Lakshmeshwar",
        phone: "7411397106",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-5",
        name: "Shri Basavaraj Bommai",
        designation: "Member of Parliament, Haveri Constituency",
        category: "Elected Representatives",
        address: "Shiggaon, Ta: Shiggaon, Dist: Haveri-581205",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-6",
        name: "Shri S V Sankannur",
        designation: "Member of Legislative Council, Graduates Constituency",
        address: "Vakil Chawl, Gadag-582101, Dist: Gadag",
        category: "Elected Representatives",
        phone: "9448301983",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "elected-7",
        name: "Shri Pradeep Shettar",
        designation: "Member of Legislative Council, Dharwad Local Authorities",
        category: "Elected Representatives",
        address: "No. 31, Madhura Estate, Nagasetty Koppa, Hubli-580023",
        phone: "8884611111",
        source: "Lakshmeshwar Town Municipal Council – Elected Representatives",
        verified: true,
    },

    {
        id: "admin-1",
        name: "Shri. Parashuram Guddadari",
        designation: "Chief Officer",
        category: "Municipal Administration",
        phone: "9986687831",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "admin-2",
        name: "Smt. Manjula B Hugar",
        designation: "Office Manager",
        category: "Municipal Administration",
        phone: "9916614534",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "engineering-1",
        name: "Smt Sindhu",
        designation: "Junior Engineer (On Deputation)",
        category: "Engineering",
        phone: "8088498021",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "engineering-2",
        name: "Shri Sharanayya Panchaksharayya Limbayyanath",
        designation: "First Division Assistant",
        category: "Engineering",
        phone: "9148874410",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "engineering-3",
        name: "Shri Somashekhar Hebbal",
        designation: "Assistant Water Supply Operator",
        category: "Engineering",
        phone: "9845038616",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "engineering-4",
        name: "Shri Chandrashekar F Hittalamani",
        designation: "Senior Valveman",
        category: "Engineering",
        phone: "9482551312",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "engineering-5",
        name: "Shri Manjunath Nandennavar",
        designation: "Senior Valveman",
        category: "Engineering",
        phone: "9901776162",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "health-1",
        name: "Shri. Manjunath F Mudgal",
        designation: "Junior Health Inspector",
        category: "Health",
        phone: "8904552335",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "health-2",
        name: "Shri Channappa Shirahatti",
        designation: "Sanitary Supervisor",
        category: "Health",
        phone: "8050838425",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "health-3",
        name: "Shri Muttappa Doddamani",
        designation: "Sanitary Supervisor",
        category: "Health",
        phone: "8861595882",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "revenue-1",
        name: "Shri Suresh Pujar",
        designation: "Revenue Officer",
        category: "Revenue",
        phone: "9060513117",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "revenue-2",
        name: "Shri Shiddalingayya M Hiremath",
        designation: "Bill Collector",
        category: "Revenue",
        phone: "9886356103",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "revenue-3",
        name: "Shri Hanumantappa N Nandennavar",
        designation: "Second Division Assistant",
        category: "Revenue",
        phone: "9945331020",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "revenue-4",
        name: "Shri Manjunath H Hebbal",
        designation: "Second Division Assistant",
        category: "Revenue",
        phone: "9743781231",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "finance-1",
        name: "Shri. Mahesh C Hosamani",
        designation: "Accounting Consultant",
        category: "Finance",
        phone: "9972162439",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "finance-2",
        name: "Smt. Netra Urf Geeta V Hosamani",
        designation: "First Division Assistant",
        category: "Finance",
        phone: "8317414705",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "daynulm-1",
        name: "Smt Shilaja H Patil",
        designation: "CAO",
        category: "Day-NULM",
        phone: "9986494507",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "daynulm-2",
        name: "Smt Laxmi Odu",
        designation: "CRP",
        category: "Day-NULM",
        phone: "8595292637",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "daynulm-3",
        name: "Smt Indira Savanur",
        designation: "CRP",
        category: "Day-NULM",
        phone: "7337843956",
        source: "Lakshmeshwar Town Municipal Council – City Staff",
        verified: true,
    },

    {
        id: "legal-1",
        name: "Shri. Parashuram Guddadari",
        designation: "Nodal Officer for Court Cases",
        category: "Legal / Nodal Officers",
        address: "Someshwara Nagar, Lakshmeshwar",
        phone: "9986687831",
        email: "ka.lakshmeshwara.tmc@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },

    {
        id: "legal-2",
        name: "Smt. Netra Urf Geeta V Hosamani",
        designation: "Nodal Officer for Court Cases",
        category: "Legal / Nodal Officers",
        address: "Near Someshwar Temple, Lakshmeshwar",
        phone: "8317414705",
        email: "ka.lakshmeshwara.tmc@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },

    {
        id: "legal-3",
        name: "Shri. Sharanayya Panchaksharayya Limbayyanath",
        designation: "Nodal Officer for Court Cases",
        category: "Legal / Nodal Officers",
        address: "Vinayaka Nagar, Lakshmeshwar",
        phone: "9148874410",
        email: "ka.lakshmeshwara.tmc@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },

    {
        id: "legal-4",
        name: "Shri. Manjunath F Mudgal",
        designation: "Nodal Officer for Court Cases",
        category: "Legal / Nodal Officers",
        address: "Someshwara Nagar, Lakshmeshwar",
        phone: "8904552335",
        email: "ka.lakshmeshwara.tmc@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },

    {
        id: "advocate-1",
        name: "Shri. Vasant M Hudedmani",
        designation: "Advocate",
        category: "Advocates",
        address: "Lakshmeshwar",
        phone: "9980646132",
        email: "hudedmanivasant@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },

    {
        id: "advocate-2",
        name: "Shri G N Narasammannavar",
        designation: "Advocate",
        category: "Advocates",
        address: "Hubli",
        phone: "9880835403",
        email: "gnangangoudanarasammannavar@gmail.com",
        source: "Lakshmeshwar Town Municipal Council – Advocates",
        verified: true,
    },
];