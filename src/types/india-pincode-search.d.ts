declare module "india-pincode-search" {
  export type PincodeEntry = {
    state: string;
    city: string;
    district: string;
    village: string;
    office: string;
    pincode: string;
  };

  export function search(pincode: string | number): PincodeEntry[];
}

