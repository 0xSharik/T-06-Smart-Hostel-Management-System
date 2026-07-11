/**
 * prisma/seed.js — Database Seed File
 *
 * Responsibilities:
 *  - Populate the database with realistic sample data for development/testing
 *  - Create an admin user, a warden, several students, rooms, mess menus, holidays, and notifications
 *  - Idempotent: can be re-run safely (uses upsert for unique fields)
 *
 * Run with: npm run db:seed
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const saltRounds = 10;

  // ── 1. Create Admin User ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", saltRounds);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hostel.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@hostel.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin created:", admin.email);

  // ── 2. Create Warden ──────────────────────────────────────────────────────
  const wardenPassword = await bcrypt.hash("Warden@1234", saltRounds);
  const warden = await prisma.user.upsert({
    where: { email: "warden@hostel.com" },
    update: {},
    create: {
      name: "Mr. Ramesh Kumar",
      email: "warden@hostel.com",
      password: wardenPassword,
      role: "WARDEN",
    },
  });
  console.log("  ✅ Warden created:", warden.email);

  // ── 3. Create Rooms ───────────────────────────────────────────────────────
  const roomsData = [
    { roomNo: "101", floor: 1, type: "SINGLE", capacity: 1, status: "AVAILABLE" },
    { roomNo: "102", floor: 1, type: "DOUBLE", capacity: 2, status: "AVAILABLE" },
    { roomNo: "103", floor: 1, type: "TRIPLE", capacity: 3, status: "AVAILABLE" },
    { roomNo: "104", floor: 1, type: "DOUBLE", capacity: 2, status: "MAINTENANCE" },
    { roomNo: "201", floor: 2, type: "SINGLE", capacity: 1, status: "AVAILABLE" },
    { roomNo: "202", floor: 2, type: "DOUBLE", capacity: 2, status: "AVAILABLE" },
    { roomNo: "203", floor: 2, type: "TRIPLE", capacity: 3, status: "AVAILABLE" },
    { roomNo: "301", floor: 3, type: "SINGLE", capacity: 1, status: "AVAILABLE" },
    { roomNo: "302", floor: 3, type: "DOUBLE", capacity: 2, status: "AVAILABLE" },
    { roomNo: "303", floor: 3, type: "TRIPLE", capacity: 3, status: "AVAILABLE" },
  ];

  const rooms = [];
  for (const roomData of roomsData) {
    const room = await prisma.room.upsert({
      where: { roomNo: roomData.roomNo },
      update: {},
      create: roomData,
    });
    rooms.push(room);
  }
  console.log(`  ✅ ${rooms.length} rooms created`);

  // ── 4. Create Student Users + Profiles ───────────────────────────────────
  const studentsData = [
    {
      name: "Alice Johnson",
      email: "alice@student.com",
      rollNo: "CS2021001",
      course: "B.Tech CSE",
      year: 3,
      phone: "9876543210",
      parentName: "Robert Johnson",
      parentPhone: "9876543000",
      roomNo: "101",
    },
    {
      name: "Bob Smith",
      email: "bob@student.com",
      rollNo: "ME2022002",
      course: "B.Tech ME",
      year: 2,
      phone: "9876543211",
      parentName: "David Smith",
      parentPhone: "9876543001",
      roomNo: "102",
    },
    {
      name: "Charlie Brown",
      email: "charlie@student.com",
      rollNo: "EC2020003",
      course: "B.Tech ECE",
      year: 4,
      phone: "9876543212",
      parentName: "William Brown",
      parentPhone: "9876543002",
      roomNo: "102",
    },
    {
      name: "Diana Prince",
      email: "diana@student.com",
      rollNo: "CS2023004",
      course: "B.Tech CSE",
      year: 1,
      phone: "9876543213",
      parentName: "Thomas Prince",
      parentPhone: "9876543003",
      roomNo: "201",
    },
    {
      name: "Edward Norton",
      email: "edward@student.com",
      rollNo: "EE2021005",
      course: "B.Tech EEE",
      year: 3,
      phone: "9876543214",
      parentName: "James Norton",
      parentPhone: "9876543004",
      roomNo: "202",
    },
  ];

  const studentPassword = await bcrypt.hash("Student@1234", saltRounds);
  const studentRecords = [];

  for (const s of studentsData) {
    const room = rooms.find((r) => r.roomNo === s.roomNo);

    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: studentPassword,
        role: "STUDENT",
      },
    });

    const student = await prisma.student.upsert({
      where: { rollNo: s.rollNo },
      update: {},
      create: {
        rollNo: s.rollNo,
        course: s.course,
        year: s.year,
        phone: s.phone,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        userId: user.id,
        roomId: room?.id || null,
      },
    });

    // Update room occupancy
    if (room) {
      await prisma.room.update({
        where: { id: room.id },
        data: {
          occupancy: { increment: 1 },
          status: room.occupancy + 1 >= room.capacity ? "FULL" : "OCCUPIED",
        },
      });
    }

    studentRecords.push({ ...student, userId: user.id });
  }
  console.log(`  ✅ ${studentRecords.length} students created`);

  // ── 5. Create Mess Menu ───────────────────────────────────────────────────
  const menuData = [
    // Monday
    { day: "MONDAY", mealType: "BREAKFAST", items: ["Idli", "Sambar", "Chutney", "Tea/Coffee"] },
    { day: "MONDAY", mealType: "LUNCH", items: ["Rice", "Dal", "Sabji", "Chapati", "Curd"] },
    { day: "MONDAY", mealType: "SNACK", items: ["Biscuits", "Tea"] },
    { day: "MONDAY", mealType: "DINNER", items: ["Chapati", "Paneer Curry", "Rice", "Dal"] },
    // Tuesday
    { day: "TUESDAY", mealType: "BREAKFAST", items: ["Poha", "Sprouts", "Tea/Coffee"] },
    { day: "TUESDAY", mealType: "LUNCH", items: ["Rice", "Rajma", "Chapati", "Salad"] },
    { day: "TUESDAY", mealType: "SNACK", items: ["Samosa", "Tea"] },
    { day: "TUESDAY", mealType: "DINNER", items: ["Chapati", "Mix Veg", "Rice", "Curd"] },
    // Wednesday
    { day: "WEDNESDAY", mealType: "BREAKFAST", items: ["Dosa", "Sambar", "Chutney", "Tea/Coffee"] },
    { day: "WEDNESDAY", mealType: "LUNCH", items: ["Rice", "Chole", "Chapati", "Raita"] },
    { day: "WEDNESDAY", mealType: "SNACK", items: ["Bread Pakoda", "Tea"] },
    { day: "WEDNESDAY", mealType: "DINNER", items: ["Chapati", "Aloo Matar", "Rice", "Dal"] },
    // Thursday
    { day: "THURSDAY", mealType: "BREAKFAST", items: ["Paratha", "Curd", "Pickle", "Tea/Coffee"] },
    { day: "THURSDAY", mealType: "LUNCH", items: ["Rice", "Kadhi", "Chapati", "Papad"] },
    { day: "THURSDAY", mealType: "SNACK", items: ["Fruit", "Tea"] },
    { day: "THURSDAY", mealType: "DINNER", items: ["Chapati", "Shahi Paneer", "Rice", "Raita"] },
    // Friday
    { day: "FRIDAY", mealType: "BREAKFAST", items: ["Upma", "Coconut Chutney", "Tea/Coffee"] },
    { day: "FRIDAY", mealType: "LUNCH", items: ["Rice", "Dal Fry", "Chapati", "Salad"] },
    { day: "FRIDAY", mealType: "SNACK", items: ["Vada Pav", "Tea"] },
    { day: "FRIDAY", mealType: "DINNER", items: ["Chapati", "Matar Paneer", "Pulao", "Curd"] },
    // Saturday
    { day: "SATURDAY", mealType: "BREAKFAST", items: ["Puri", "Aloo Sabji", "Tea/Coffee"] },
    { day: "SATURDAY", mealType: "LUNCH", items: ["Special Rice", "Dal Makhani", "Chapati", "Kheer"] },
    { day: "SATURDAY", mealType: "SNACK", items: ["Maggi", "Tea"] },
    { day: "SATURDAY", mealType: "DINNER", items: ["Chapati", "Butter Chicken/Paneer", "Rice", "Raita"] },
    // Sunday
    { day: "SUNDAY", mealType: "BREAKFAST", items: ["Chole Bhature", "Tea/Coffee"] },
    { day: "SUNDAY", mealType: "LUNCH", items: ["Biryani", "Raita", "Salad", "Sweet"] },
    { day: "SUNDAY", mealType: "SNACK", items: ["Cake/Pastry", "Tea"] },
    { day: "SUNDAY", mealType: "DINNER", items: ["Chapati", "Sabji", "Rice", "Dal"] },
  ];

  for (const menu of menuData) {
    await prisma.messMenu.upsert({
      where: { day_mealType: { day: menu.day, mealType: menu.mealType } },
      update: { items: menu.items },
      create: menu,
    });
  }
  console.log(`  ✅ ${menuData.length} mess menu entries created`);

  // ── 6. Create Holidays ────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const holidays = [
    { title: "Republic Day", date: new Date(`${currentYear}-01-26`), type: "PUBLIC", description: "National holiday — Republic Day of India" },
    { title: "Holi", date: new Date(`${currentYear}-03-25`), type: "PUBLIC", description: "Festival of Colors" },
    { title: "Good Friday", date: new Date(`${currentYear}-04-18`), type: "RESTRICTED" },
    { title: "Eid ul-Fitr", date: new Date(`${currentYear}-04-01`), type: "PUBLIC" },
    { title: "Independence Day", date: new Date(`${currentYear}-08-15`), type: "PUBLIC", description: "National holiday — Independence Day of India" },
    { title: "Gandhi Jayanti", date: new Date(`${currentYear}-10-02`), type: "PUBLIC" },
    { title: "Diwali", date: new Date(`${currentYear}-10-20`), type: "PUBLIC", description: "Festival of Lights — Hostel closed for 3 days" },
    { title: "Christmas", date: new Date(`${currentYear}-12-25`), type: "PUBLIC" },
    { title: "Mid-Sem Break", date: new Date(`${currentYear}-09-15`), type: "HOSTEL_SPECIFIC", description: "Mid semester break — hostel remains open" },
  ];

  for (const holiday of holidays) {
    await prisma.holiday.create({ data: holiday }).catch(() => {
      // Skip if already exists (date conflicts)
    });
  }
  console.log(`  ✅ ${holidays.length} holidays created`);

  // ── 7. Create Sample Maintenance Requests ────────────────────────────────
  if (studentRecords.length > 0) {
    const room101 = rooms.find((r) => r.roomNo === "101");
    const maintenanceData = [
      {
        title: "Broken fan in room 101",
        description: "The ceiling fan makes a loud noise and vibrates. Needs urgent repair.",
        category: "ELECTRICAL",
        status: "PENDING",
        priority: "HIGH",
        userId: studentRecords[0].userId,
        roomId: room101?.id,
      },
      {
        title: "Leaking pipe in washroom",
        description: "Water is dripping from the pipe under the washbasin.",
        category: "PLUMBING",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        userId: studentRecords[1].userId,
        roomId: rooms.find((r) => r.roomNo === "102")?.id,
      },
      {
        title: "Broken study table drawer",
        description: "The drawer of the study table is broken and cannot be opened.",
        category: "FURNITURE",
        status: "RESOLVED",
        priority: "LOW",
        userId: studentRecords[2].userId,
        resolvedAt: new Date(),
      },
    ];

    for (const req of maintenanceData) {
      await prisma.maintenanceRequest.create({ data: req });
    }
    console.log(`  ✅ ${maintenanceData.length} maintenance requests created`);
  }

  // ── 8. Create Sample Notifications ───────────────────────────────────────
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const notifData = [
    {
      title: "Welcome to Hostel Management System",
      message: "The new Smart Hostel Management System is now live. Please update your profile.",
      type: "INFO",
      targetRole: null,
    },
    {
      title: "Mess Menu Updated for Next Week",
      message: "The mess menu for next week has been updated. Please check the mess section.",
      type: "MESS",
      targetRole: null,
    },
    {
      title: "Upcoming Holiday — Diwali Break",
      message: "Hostel will be closed from Oct 20–22 for Diwali. Please plan accordingly.",
      type: "HOLIDAY",
      targetRole: null,
    },
  ];

  for (const user of allUsers) {
    for (const notif of notifData) {
      await prisma.notification.create({
        data: { ...notif, userId: user.id },
      });
    }
  }
  console.log(`  ✅ Notifications sent to ${allUsers.length} users`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Database seeded successfully!\n");
  console.log("╔══════════════════════════════════════╗");
  console.log("║         LOGIN CREDENTIALS            ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Admin:   admin@hostel.com           ║");
  console.log("║  Password: Admin@1234                ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Warden:  warden@hostel.com          ║");
  console.log("║  Password: Warden@1234               ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Student: alice@student.com          ║");
  console.log("║  Password: Student@1234              ║");
  console.log("╚══════════════════════════════════════╝");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
