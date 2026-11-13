import { NextResponse, type NextRequest } from "next/server";
import { City, State } from "country-state-city";

const COUNTRY_CODE = "IN";

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams
    .get("stateCode")
    ?.trim()
    .toUpperCase();

  if (stateCode) {
    const state = State.getStateByCodeAndCountry(stateCode, COUNTRY_CODE);
    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: "Selected Indian state was not found.",
          },
        },
        { status: 404 },
      );
    }

    const cityNames = Array.from(
      new Set(
        City.getCitiesOfState(COUNTRY_CODE, stateCode).map((item) => item.name),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      data: {
        stateCode: state.isoCode,
        stateName: state.name,
        cities: cityNames,
      },
    });
  }

  const states = State.getStatesOfCountry(COUNTRY_CODE)
    .map((item) => ({
      code: item.isoCode,
      name: item.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    success: true,
    data: { states },
  });
}

