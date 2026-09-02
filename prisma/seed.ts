import { PrismaClient, Role, AppointmentStatus, DayOfWeek } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seed() {
  console.log("Seeding database...");

  // Clear existing
  await prisma.statusAudit.deleteMany().catch(() => {});
  await prisma.appointment.deleteMany().catch(() => {});
  await prisma.client.deleteMany().catch(() => {});
  await prisma.service.deleteMany().catch(() => {});
  await prisma.weeklyAvailability.deleteMany().catch(() => {});
  await prisma.blackoutPeriod.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const staffPasswordHash = await bcrypt.hash("StaffPass123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@calenpulse.internal",
      name: "Dr. Sarah Sterling (Director)",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@calenpulse.internal",
      name: "Alex Rivera (Operations)",
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
    },
  });

  console.log("Created users:", admin.email, staff.email);

  // Weekly availability
  const days: { day: DayOfWeek; start: string; end: string; active: boolean }[] = [
    { day: DayOfWeek.MONDAY, start: "09:00", end: "18:00", active: true },
    { day: DayOfWeek.TUESDAY, start: "09:00", end: "18:00", active: true },
    { day: DayOfWeek.WEDNESDAY, start: "09:00", end: "18:00", active: true },
    { day: DayOfWeek.THURSDAY, start: "09:00", end: "18:00", active: true },
    { day: DayOfWeek.FRIDAY, start: "09:00", end: "18:00", active: true },
    { day: DayOfWeek.SATURDAY, start: "10:00", end: "16:00", active: true },
    { day: DayOfWeek.SUNDAY, start: "10:00", end: "14:00", active: false },
  ];

  for (const item of days) {
    await prisma.weeklyAvailability.create({
      data: {
        dayOfWeek: item.day,
        startTime: item.start,
        endTime: item.end,
        isActive: item.active,
      },
    });
  }

  // Blackout period
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 14);
  const blackoutEnd = new Date(nextMonth);
  blackoutEnd.setDate(blackoutEnd.getDate() + 2);

  await prisma.blackoutPeriod.create({
    data: {
      title: "Studio Facility Maintenance & Staff Training",
      startDate: nextMonth,
      endDate: blackoutEnd,
    },
  });

  // Services
  const service1 = await prisma.service.create({
    data: {
      name: "Initial Consultation & Assessment",
      slug: "initial-consultation",
      description: "In-depth diagnostic review of client goals, baseline evaluation, and preliminary roadmap design.",
      durationMin: 45,
      bufferMin: 15,
      price: 85.0,
      colorTag: "#3B82F6",
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: "Comprehensive Strategy Review",
      slug: "comprehensive-review",
      description: "Full-scale holistic assessment with tailored protocol delivery, metric checkpoints, and action items.",
      durationMin: 60,
      bufferMin: 15,
      price: 140.0,
      colorTag: "#10B981",
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: "Follow-Up Progress Session",
      slug: "follow-up-session",
      description: "Targeted accountability check-in, obstacle troubleshooting, and incremental protocol adjustments.",
      durationMin: 30,
      bufferMin: 10,
      price: 55.0,
      colorTag: "#8B5CF6",
      isActive: true,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: "Extended Deep-Dive Consultation",
      slug: "extended-deep-dive",
      description: "Comprehensive intensive working session designed for multi-variable problem solving and complex cases.",
      durationMin: 90,
      bufferMin: 20,
      price: 195.0,
      colorTag: "#F59E0B",
      isActive: true,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      name: "Express Priority Check-In",
      slug: "express-priority-checkin",
      description: "Fast-track focused triage for urgent clarifications and immediate tactical guidance.",
      durationMin: 20,
      bufferMin: 10,
      price: 40.0,
      colorTag: "#EC4899",
      isActive: true,
    },
  });

  // Clients
  const clientData = [
    { fullName: "Elena Rostova", email: "elena.rostova@example.com", phone: "+1-555-0192", notes: "Prefers morning slots. Referred by Dr. Sterling." },
    { fullName: "Marcus Vance", email: "marcus.vance@example.com", phone: "+1-555-0283", notes: "Requires digital summary after every session." },
    { fullName: "Sophia Chen", email: "sophia.chen@example.com", phone: "+1-555-0374", notes: "Long-standing quarterly client." },
    { fullName: "David Kalu", email: "david.kalu@example.com", phone: "+1-555-0465", notes: "Prefers concise direct summaries." },
    { fullName: "Claire Beauchamp", email: "claire.b@example.com", phone: "+1-555-0556", notes: "Follows up regularly on wellness goals." },
    { fullName: "Jordan Hayes", email: "jordan.hayes@example.com", phone: "+1-555-0647", notes: "Flexible on afternoon time slots." },
    { fullName: "Liam O'Connor", email: "liam.oc@example.com", phone: "+1-555-0738", notes: "Preparing for autumn athletic season." },
    { fullName: "Priya Patel", email: "priya.patel@example.com", phone: "+1-555-0829", notes: "Attends remote & in-studio alternating." },
    { fullName: "Lucas Silva", email: "lucas.silva@example.com", phone: "+1-555-0910", notes: "Corporate wellness group member." },
    { fullName: "Maya Lin", email: "maya.lin@example.com", phone: "+1-555-1001", notes: "First-time visitor looking for assessment." },
  ];

  const clients = [];
  for (const c of clientData) {
    const created = await prisma.client.create({ data: c });
    clients.push(created);
  }

  // Generate 18 realistic appointments
  const services = [service1, service2, service3, service4, service5];
  const now = new Date();

  // Helper to create date relative to today
  const relativeDate = (dayOffset: number, hours: number, minutes: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const sampleAppointments = [
    // Today appointments
    {
      code: "CP-89247",
      clientIdx: 0,
      serviceIdx: 0,
      start: relativeDate(0, 9, 30),
      duration: 45,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "First visit, interested in baseline posture analysis.",
      internalNotes: "Intake form received and verified.",
    },
    {
      code: "CP-41829",
      clientIdx: 1,
      serviceIdx: 1,
      start: relativeDate(0, 11, 0),
      duration: 60,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Quarterly wellness review.",
      internalNotes: "Print updated assessment sheet.",
    },
    {
      code: "CP-73104",
      clientIdx: 2,
      serviceIdx: 2,
      start: relativeDate(0, 14, 0),
      duration: 30,
      status: AppointmentStatus.PENDING,
      clientNotes: "Quick check-in regarding recent routine changes.",
      internalNotes: "Awaiting staff confirmation.",
    },
    {
      code: "CP-95281",
      clientIdx: 3,
      serviceIdx: 3,
      start: relativeDate(0, 15, 30),
      duration: 90,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Comprehensive annual strategy session.",
      internalNotes: "Prepare boardroom A.",
    },

    // Tomorrow appointments
    {
      code: "CP-12845",
      clientIdx: 4,
      serviceIdx: 0,
      start: relativeDate(1, 10, 0),
      duration: 45,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Referred by Dr. Sterling.",
      internalNotes: "New client intake.",
    },
    {
      code: "CP-63910",
      clientIdx: 5,
      serviceIdx: 2,
      start: relativeDate(1, 11, 30),
      duration: 30,
      status: AppointmentStatus.PENDING,
      clientNotes: "Follow-up discussion.",
      internalNotes: "",
    },
    {
      code: "CP-84723",
      clientIdx: 6,
      serviceIdx: 1,
      start: relativeDate(1, 14, 30),
      duration: 60,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Athletic prep check-in.",
      internalNotes: "Review telemetry log.",
    },

    // Day + 2 appointments
    {
      code: "CP-39184",
      clientIdx: 7,
      serviceIdx: 4,
      start: relativeDate(2, 9, 30),
      duration: 20,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Priority check-in.",
      internalNotes: "Short touchpoint.",
    },
    {
      code: "CP-57201",
      clientIdx: 8,
      serviceIdx: 0,
      start: relativeDate(2, 13, 0),
      duration: 45,
      status: AppointmentStatus.PENDING,
      clientNotes: "Needs afternoon slot specifically.",
      internalNotes: "",
    },
    {
      code: "CP-91024",
      clientIdx: 9,
      serviceIdx: 1,
      start: relativeDate(2, 15, 0),
      duration: 60,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Initial review for wellness membership.",
      internalNotes: "",
    },

    // Day + 3 & +4 appointments
    {
      code: "CP-20485",
      clientIdx: 0,
      serviceIdx: 2,
      start: relativeDate(3, 10, 30),
      duration: 30,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Routine adjustment.",
      internalNotes: "",
    },
    {
      code: "CP-77192",
      clientIdx: 1,
      serviceIdx: 3,
      start: relativeDate(4, 14, 0),
      duration: 90,
      status: AppointmentStatus.CONFIRMED,
      clientNotes: "Extended strategy.",
      internalNotes: "Prepare slide deck.",
    },

    // Past appointments (Completed & Cancelled)
    {
      code: "CP-10293",
      clientIdx: 2,
      serviceIdx: 0,
      start: relativeDate(-1, 10, 0),
      duration: 45,
      status: AppointmentStatus.COMPLETED,
      clientNotes: "Initial diagnostic.",
      internalNotes: "Session conducted smoothly. Recommendations sent via email.",
    },
    {
      code: "CP-38472",
      clientIdx: 3,
      serviceIdx: 1,
      start: relativeDate(-1, 14, 0),
      duration: 60,
      status: AppointmentStatus.COMPLETED,
      clientNotes: "Full review.",
      internalNotes: "Completed on schedule.",
    },
    {
      code: "CP-49102",
      clientIdx: 4,
      serviceIdx: 2,
      start: relativeDate(-2, 11, 0),
      duration: 30,
      status: AppointmentStatus.COMPLETED,
      clientNotes: "Check-in.",
      internalNotes: "Client reported 20% improvement.",
    },
    {
      code: "CP-68291",
      clientIdx: 5,
      serviceIdx: 0,
      start: relativeDate(-2, 15, 30),
      duration: 45,
      status: AppointmentStatus.CANCELLED,
      clientNotes: "Travel conflict.",
      internalNotes: "Client called to cancel due to flight delay.",
      cancellationReason: "Client had travel emergency and requested cancellation.",
    },
    {
      code: "CP-88371",
      clientIdx: 6,
      serviceIdx: 1,
      start: relativeDate(-3, 9, 30),
      duration: 60,
      status: AppointmentStatus.COMPLETED,
      clientNotes: "Regular consult.",
      internalNotes: "Completed.",
    },
    {
      code: "CP-99201",
      clientIdx: 7,
      serviceIdx: 4,
      start: relativeDate(-3, 16, 0),
      duration: 20,
      status: AppointmentStatus.NO_SHOW,
      clientNotes: "Quick check.",
      internalNotes: "Client did not attend session and did not respond to confirmation.",
      cancellationReason: "No show - no prior notification received.",
    },
  ];

  for (const appt of sampleAppointments) {
    const end = new Date(appt.start);
    end.setMinutes(end.getMinutes() + appt.duration);

    const createdAppt = await prisma.appointment.create({
      data: {
        referenceCode: appt.code,
        serviceId: services[appt.serviceIdx].id,
        clientId: clients[appt.clientIdx].id,
        startTime: appt.start,
        endTime: end,
        status: appt.status,
        clientNotes: appt.clientNotes,
        internalNotes: appt.internalNotes,
        cancellationReason: appt.cancellationReason || null,
      },
    });

    // Create status audit log
    await prisma.statusAudit.create({
      data: {
        appointmentId: createdAppt.id,
        changedById: staff.id,
        fromStatus: AppointmentStatus.PENDING,
        toStatus: appt.status,
        notes: `Initial state created as ${appt.status}. ${appt.internalNotes || ""}`,
        timestamp: new Date(appt.start.getTime() - 24 * 3600 * 1000),
      },
    });
  }

  console.log("Database seeded successfully with 18 appointments, 5 services, 10 clients, 2 users.");
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error("Seed error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
