enum YesOrNo {
    EMPTY = "-",
    YES = "Yes",
    NO = "No"
}

enum EquipmentType {
    REFRIGERATION = "Refrigeration",
    HVAC = "HVAC",
    KITCHEN = "Kitchen",
    PLUMBING = "Plumbing"
}

enum PreferredTime {
    TIME_6_9 = "6-9",
    TIME_9_12 = "9-12",
    TIME_12_2_30 = "12-2:30"
}

export default interface FormData {
    'Street_1': string;
    'Street_2'?: string;
    'Street_3'?: string;
    'Street_4'?: string;
    'City': string;
    'State': string;
    'Zip': string;
    "First_Name": string;
    "Last_Name": string;
    "Email_Address": string;
    "Phone_Number": string;
    "Phone_Number_Ext": string;
    "Alternative_Phone_Number": string;
    "Alternative_Phone_Number_Ext": string;
    "Manufacturer": string;
    'Model': string;
    'Under_Manufacturer_Warranty': YesOrNo
    "Recently_Serviced": YesOrNo;
    "Service_Info": string;
    "Require_PO_number" : YesOrNo;
    "Purchase_Order_Number": string;
    'Location': string;
    'Type': EquipmentType;
    'Description': string
    'Preferred_Date': string;
    'Preferred_Time': PreferredTime;
    "OT_Approved" : YesOrNo;
    "Comments": string;
}