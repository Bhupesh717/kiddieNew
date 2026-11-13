import { NextResponse, type NextRequest } from "next/server";
import { City, State } from "country-state-city";
import { search as searchIndianPincode } from "india-pincode-search";

const COUNTRY_CODE = "IN";

const PIN_STATE_TO_ISO: Record<string, string> = {
  "ANDAMAN & NICOBAR ISLANDS": "AN",
  "ANDHRA PRADESH": "AP",
  "ARUNACHAL PRADESH": "AR",
  ASSAM: "AS",
  BIHAR: "BR",
  CHANDIGARH: "CH",
  CHATTISGARH: "CT",
  CHHATTISGARH: "CT",
  "DADRA & NAGAR HAVELI": "DH",
  "DAMAN & DIU": "DH",
  DELHI: "DL",
  GOA: "GA",
  GUJARAT: "GJ",
  HARYANA: "HR",
  "HIMACHAL PRADESH": "HP",
  "JAMMU & KASHMIR": "JK",
  JHARKHAND: "JH",
  KARNATAKA: "KA",
  KERALA: "KL",
  LADAKH: "LA",
  LAKSHADWEEP: "LD",
  "MADHYA PRADESH": "MP",
  MAHARASHTRA: "MH",
  MANIPUR: "MN",
  MEGHALAYA: "ML",
  MIZORAM: "MZ",
  NAGALAND: "NL",
  ODISHA: "OR",
  ORISSA: "OR",
  PONDICHERRY: "PY",
  PUDUCHERRY: "PY",
  PUNJAB: "PB",
  RAJASTHAN: "RJ",
  SIKKIM: "SK",
  "TAMIL NADU": "TN",
  TELANGANA: "TG",
  TRIPURA: "TR",
  "UTTAR PRADESH": "UP",
  UTTARAKHAND: "UT",
  "WEST BENGAL": "WB",
};

function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .trim();
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ pincode: string }> },
) {
  const { pincode } = await context.params;
  const cleaned = pincode.trim();

  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PINCODE",
          message: "PIN code must be 6 digits and cannot start with 0.",
        },
      },
      { status: 400 },
    );
  }

  const matches = searchIndianPincode(cleaned);
  if (!matches || matches.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PINCODE_NOT_FOUND",
          message: `PIN code ${cleaned} was not found in the India Post directory.`,
        },
      },
      { status: 404 },
    );
  }

  const first = matches[0];
  const rawStateUpper = first.state.trim().toUpperCase();
  const indianStates = State.getStatesOfCountry(COUNTRY_CODE);
  const mappedIso = PIN_STATE_TO_ISO[rawStateUpper];
  const matchedState =
    indianStates.find((item) => item.isoCode === mappedIso) ??
    indianStates.find(
      (item) => item.name.toUpperCase() === rawStateUpper,
    );

  const stateCode = matchedState?.isoCode ?? "";
  const stateName = matchedState?.name ?? toTitleCase(first.state);

  const stateCities = stateCode
    ? Array.from(
        new Set(
          City.getCitiesOfState(COUNTRY_CODE, stateCode).map((c) => c.name),
        ),
      ).sort((a, b) => a.localeCompare(b))
    : [];

  const candidateDistrict = toTitleCase(first.district || first.city);
  const candidateCity = toTitleCase(first.city || first.district);

  const matchedCityInList =
    stateCities.find(
      (name) => name.toLowerCase() === candidateDistrict.toLowerCase(),
    ) ??
    stateCities.find(
      (name) => name.toLowerCase() === candidateCity.toLowerCase(),
    );

  const resolvedCity = matchedCityInList ?? candidateDistrict;
  const citiesWithPin = resolvedCity
    ? Array.from(new Set([resolvedCity, ...stateCities])).sort((a, b) =>
        a.localeCompare(b),
      )
    : stateCities;

  return NextResponse.json({
    success: true,
    data: {
      pincode: cleaned,
      stateCode,
      stateName,
      city: resolvedCity,
      district: candidateDistrict,
      office: first.office,
      cities: citiesWithPin,
    },
  });
}

