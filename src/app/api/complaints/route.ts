import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb, ComplaintPriority } from "@/lib/db/complaints";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaints
 * Returns all complaints filed by the currently authenticated citizen.
 * Strictly scopes query to the session's citizenId.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access citizen complaints." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await complaintDb.listByCitizen(citizen.id, {
      status,
      category,
      ward,
      priority,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      count: result.complaints.length,
      total: result.total,
      data: result.complaints,
    });
  } catch (error) {
    console.error("Error retrieving citizen complaints:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching complaints." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints
 * Registers a new citizen grievance against Lakshmeshwar Town Municipal Council.
 * Derives citizen_id strictly from the authenticated session.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to lodge an official citizen complaint." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      category,
      title,
      description,
      ward,
      address,
      latitude,
      longitude,
      photoUrl,
      priority,
    } = body;

    // 1. Validation: Category
    if (!category || typeof category !== "string" || category.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please select a valid municipal category for your complaint." },
        { status: 400 }
      );
    }

    // 2. Validation: Title / Subject
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Please provide a descriptive title or subject (at least 3 characters)." },
        { status: 400 }
      );
    }

    if (title.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: "Title exceeds maximum permitted length of 255 characters." },
        { status: 400 }
      );
    }

    // 3. Validation: Description
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a detailed description of the issue (at least 10 characters)." },
        { status: 400 }
      );
    }

    // 4. Validation: Ward / Locality
    const cleanWard = (ward && typeof ward === "string" ? ward.trim() : "") || citizen.wardNumber;
    if (!cleanWard) {
      return NextResponse.json(
        { success: false, error: "Ward/locality selection is required for municipal dispatch." },
        { status: 400 }
      );
    }

    // 5. Priority Sanitization
    const validPriorities: ComplaintPriority[] = ["Low", "Medium", "High", "Urgent"];
    let sanitizedPriority: ComplaintPriority = "Medium";
    if (priority && validPriorities.includes(priority as ComplaintPriority)) {
      sanitizedPriority = priority as ComplaintPriority;
    }

    // 6. Coordinates Validation (optional)
    let parsedLat: number | null = null;
    let parsedLng: number | null = null;
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      const lat = Number(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { success: false, error: "Invalid latitude coordinate value." },
          { status: 400 }
        );
      }
      parsedLat = lat;
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      const lng = Number(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json(
          { success: false, error: "Invalid longitude coordinate value." },
          { status: 400 }
        );
      }
      parsedLng = lng;
    }

    // 7. Residential Address fallback
    const resolvedAddress = (address && typeof address === "string" ? address.trim() : "") || citizen.residentialAddress;

    // 8. Create Complaint in PostgreSQL
    const complaint = await complaintDb.createComplaint({
      citizenId: citizen.id,
      createdByName: citizen.fullName,
      category: category.trim(),
      title: title.trim(),
      description: description.trim(),
      ward: cleanWard,
      address: resolvedAddress || undefined,
      latitude: parsedLat,
      longitude: parsedLng,
      photoUrl: photoUrl && typeof photoUrl === "string" ? photoUrl.trim() : null,
      priority: sanitizedPriority,
    });

    // Notify authority desk of new complaint registration
    await notificationService.notifyComplaintRegistered(
      complaint.id,
      complaint.category,
      complaint.ward,
      citizen.id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Your complaint has been submitted successfully to Lakshmeshwar TMC.",
        data: complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting complaint:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while filing your complaint." },
      { status: 500 }
    );
  }
}
