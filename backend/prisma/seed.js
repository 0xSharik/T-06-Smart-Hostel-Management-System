/**
 * prisma/seed.js — Database Seed File
 *
 * Populates 100 rooms (Floors 1-5, 20 rooms/floor) and 200 student records
 * plus Admin, Warden, Mess Menu, Maintenance Tickets (including SLA breaches), and Notifications.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with 100 rooms and 200 student records...");

  const saltRounds = 10;

  // ── 1. Admin ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", saltRounds);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hostel.com" },
    update: {},
    create: {
      name: "Admin System User",
      email: "admin@hostel.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin user:", admin.email);

  // ── 2. Warden ─────────────────────────────────────────────────────────────
  const wardenPassword = await bcrypt.hash("Warden@1234", saltRounds);
  const warden = await prisma.user.upsert({
    where: { email: "warden@hostel.com" },
    update: {},
    create: {
      name: "Mr. Ramesh Kumar (Chief Warden)",
      email: "warden@hostel.com",
      password: wardenPassword,
      role: "WARDEN",
    },
  });
  console.log("  ✅ Warden user:", warden.email);

  // ── 3. Create 100 Rooms (5 Floors x 20 Rooms) ────────────────────────────
  const roomTypes = ["SINGLE", "DOUBLE", "TRIPLE"];
  const createdRooms = [];
  const demoEmptyRooms = new Set();

  for (let floor = 1; floor <= 5; floor++) {
    for (let r = 1; r <= 20; r++) {
      const roomNum = `${floor}${r < 10 ? "0" + r : r}`;
      const type = roomTypes[(floor + r) % 3];
      const capacity = type === "SINGLE" ? 1 : type === "DOUBLE" ? 2 : 3;
      // Rooms under maintenance: specific rooms that are known-broken
      const underMaintenance = (floor === 2 && r === 14) || (floor === 4 && r === 7) || (floor === 5 && r === 18);
      // Reserved empty rooms — intentionally left for allotment demos / realistic gaps
      // r==10 and r==20 on every floor, plus all Floor 5 rooms >= 16
      const reservedEmpty = r === 10 || r === 20 || (floor === 5 && r >= 16);
      if (reservedEmpty) demoEmptyRooms.add(roomNum);

      const room = await prisma.room.upsert({
        where: { roomNo: roomNum },
        update: {
          floor,
          type,
          capacity,
          occupancy: 0, // Will be updated as students are assigned below
          status: underMaintenance ? "MAINTENANCE" : "AVAILABLE",
          amenities: ["Bed", "Study Desk", "Wardrobe", "High-speed Wi-Fi"],
        },
        create: {
          roomNo: roomNum,
          floor,
          type,
          capacity,
          occupancy: 0,
          status: underMaintenance ? "MAINTENANCE" : "AVAILABLE",
          amenities: ["Bed", "Study Desk", "Wardrobe", "High-speed Wi-Fi"],
        },
      });
      createdRooms.push(room);
    }
  }
  console.log(`  ✅ ${createdRooms.length} rooms populated (Floors 1–5).`);

  // Reset all students' room assignments so we get a clean slate on re-seed
  await prisma.student.updateMany({ data: { roomId: null } });

  // ── 4. Create 200 Students + Users ───────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@1234", saltRounds);
  const courses = ["B.Tech CSE", "B.Tech ECE", "B.Tech ME", "B.Tech CE"];
  const firstNames = ["Aarav", "Aditi", "Kabir", "Meera", "Rohan", "Ananya", "Ishaan", "Nisha", "Vivaan", "Sanya"];
  const lastNames = ["Sharma", "Patel", "Kumar", "Reddy", "Nair", "Singh", "Iyer", "Das", "Mehta", "Roy"];
  const createdStudents = [];
  const assignableRooms = createdRooms.filter((room) => room.status !== "MAINTENANCE" && !demoEmptyRooms.has(room.roomNo));
  let roomIndex = 0;

  for (let i = 1; i <= 200; i++) {
    const pad = String(i).padStart(3, "0");
    const email = `student${i}@hostel.com`;
    const rollNo = `ST2024${pad}`;
    const course = courses[i % courses.length];
    const year = (i % 4) + 1;
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;

    // Assign most students while keeping empty rooms and a visible waiting list for allotment demos.
    let assignedRoom = null;
    if (i <= 172 && i % 17 !== 0) {
      while (roomIndex < assignableRooms.length) {
        const targetRoom = assignableRooms[roomIndex];
        if (targetRoom.occupancy < targetRoom.capacity) {
          assignedRoom = targetRoom;
          targetRoom.occupancy += 1;
          targetRoom.status = targetRoom.occupancy >= targetRoom.capacity ? "FULL" : "OCCUPIED";
          if (targetRoom.occupancy >= targetRoom.capacity) roomIndex++;
          break;
        }
        roomIndex++;
      }
    }

    if (!assignedRoom && i <= 172 && i % 17 !== 0 && roomIndex < assignableRooms.length) {
      const targetRoom = assignableRooms[roomIndex];
      if (targetRoom.occupancy < targetRoom.capacity) {
        assignedRoom = targetRoom;
        targetRoom.occupancy += 1;
        targetRoom.status = targetRoom.occupancy >= targetRoom.capacity ? "FULL" : "OCCUPIED";
      }
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        name,
        email,
        password: studentPassword,
        role: "STUDENT",
      },
    });

    const student = await prisma.student.upsert({
      where: { rollNo },
      update: {
        course,
        year,
        phone: `98765${String(10005 + i).slice(-5)}`,
        parentName: `${lastNames[(i * 5) % lastNames.length]} Family`,
        parentPhone: `98765${String(20005 + i).slice(-5)}`,
        roomId: assignedRoom?.id || null,
      },
      create: {
        rollNo,
        course,
        year,
        phone: `98765${String(10005 + i).slice(-5)}`,
        parentName: `${lastNames[(i * 5) % lastNames.length]} Family`,
        parentPhone: `98765${String(20005 + i).slice(-5)}`,
        userId: user.id,
        roomId: assignedRoom?.id || null,
      },
    });

    if (assignedRoom) {
      await prisma.room.update({
        where: { id: assignedRoom.id },
        data: {
          occupancy: assignedRoom.occupancy,
          status: assignedRoom.status,
        },
      });
    }

    createdStudents.push({ ...student, userId: user.id });
  }
  console.log(`  ✅ ${createdStudents.length} student records populated.`);

  // ── 5. Mess Menu (Full 7 Days x 4 Meals) ──────────────────────────────────
  const menuData = [
    { day: "MONDAY", mealType: "BREAKFAST", items: ["Idli", "Sambar", "Chutney", "Tea/Coffee"] },
    { day: "MONDAY", mealType: "LUNCH", items: ["Rice", "Dal", "Sabji", "Chapati", "Curd"] },
    { day: "MONDAY", mealType: "SNACK", items: ["Biscuits", "Tea"] },
    { day: "MONDAY", mealType: "DINNER", items: ["Chapati", "Paneer Curry", "Rice", "Dal"] },

    { day: "TUESDAY", mealType: "BREAKFAST", items: ["Poha", "Sprouts", "Tea/Coffee"] },
    { day: "TUESDAY", mealType: "LUNCH", items: ["Rice", "Rajma", "Chapati", "Salad"] },
    { day: "TUESDAY", mealType: "SNACK", items: ["Samosa", "Tea"] },
    { day: "TUESDAY", mealType: "DINNER", items: ["Chapati", "Mix Veg", "Rice", "Curd"] },

    { day: "WEDNESDAY", mealType: "BREAKFAST", items: ["Dosa", "Sambar", "Chutney", "Tea/Coffee"] },
    { day: "WEDNESDAY", mealType: "LUNCH", items: ["Rice", "Chole", "Chapati", "Raita"] },
    { day: "WEDNESDAY", mealType: "SNACK", items: ["Bread Pakoda", "Tea"] },
    { day: "WEDNESDAY", mealType: "DINNER", items: ["Chapati", "Aloo Matar", "Rice", "Dal"] },

    { day: "THURSDAY", mealType: "BREAKFAST", items: ["Paratha", "Curd", "Pickle", "Tea/Coffee"] },
    { day: "THURSDAY", mealType: "LUNCH", items: ["Rice", "Kadhi", "Chapati", "Papad"] },
    { day: "THURSDAY", mealType: "SNACK", items: ["Fruit", "Tea"] },
    { day: "THURSDAY", mealType: "DINNER", items: ["Chapati", "Shahi Paneer", "Rice", "Raita"] },

    { day: "FRIDAY", mealType: "BREAKFAST", items: ["Upma", "Coconut Chutney", "Tea/Coffee"] },
    { day: "FRIDAY", mealType: "LUNCH", items: ["Rice", "Dal Fry", "Chapati", "Salad"] },
    { day: "FRIDAY", mealType: "SNACK", items: ["Vada Pav", "Tea"] },
    { day: "FRIDAY", mealType: "DINNER", items: ["Chapati", "Matar Paneer", "Pulao", "Curd"] },

    { day: "SATURDAY", mealType: "BREAKFAST", items: ["Puri", "Aloo Sabji", "Tea/Coffee"] },
    { day: "SATURDAY", mealType: "LUNCH", items: ["Special Rice", "Dal Makhani", "Chapati", "Kheer"] },
    { day: "SATURDAY", mealType: "SNACK", items: ["Maggi", "Tea"] },
    { day: "SATURDAY", mealType: "DINNER", items: ["Chapati", "Paneer Butter Masala", "Rice", "Raita"] },

    { day: "SUNDAY", mealType: "BREAKFAST", items: ["Chole Bhature", "Tea/Coffee"] },
    { day: "SUNDAY", mealType: "LUNCH", items: ["Veg Biryani", "Raita", "Salad", "Gulab Jamun"] },
    { day: "SUNDAY", mealType: "SNACK", items: ["Pastry", "Tea"] },
    { day: "SUNDAY", mealType: "DINNER", items: ["Chapati", "Sabji", "Rice", "Dal"] },
  ];

  for (const menu of menuData) {
    await prisma.messMenu.upsert({
      where: { day_mealType: { day: menu.day, mealType: menu.mealType } },
      update: { items: menu.items },
      create: menu,
    });
  }
  console.log(`  ✅ ${menuData.length} mess menu slots populated.`);

  // ── 6. Maintenance Requests (including SLA breach sample) ─────────────────
  await prisma.messFeedback.deleteMany({ where: { comment: { startsWith: "Demo feedback:" } } });
  const menuSlots = await prisma.messMenu.findMany({ take: 12, orderBy: [{ day: "asc" }, { mealType: "asc" }] });
  const feedbackComments = [
    "Demo feedback: breakfast was fresh but tea ran out early.",
    "Demo feedback: lunch quantity was good, dal needed less salt.",
    "Demo feedback: snack counter queue was manageable today.",
    "Demo feedback: dinner paneer was popular with second-year students.",
  ];
  for (let i = 0; i < 28; i++) {
    await prisma.messFeedback.create({
      data: {
        rating: 3 + (i % 3),
        comment: feedbackComments[i % feedbackComments.length],
        date: new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000),
        userId: createdStudents[i % createdStudents.length].userId,
        messMenuId: menuSlots[i % menuSlots.length].id,
      },
    });
  }
  console.log("  ✅ Mess feedback trend samples created.");

  const overdueDate = new Date(Date.now() - 52 * 60 * 60 * 1000); // 52 hours ago (breached SLA)
  const maintenanceSamples = [
    {
      title: "Ceiling Fan Vibration",
      description: "Ceiling fan vibrates excessively and produces noise.",
      category: "ELECTRICAL",
      status: "PENDING",
      priority: "URGENT",
      createdAt: overdueDate,
      userId: createdStudents[0].userId,
    },
    {
      title: "Washbasin Tap Leakage",
      description: "Water leaking continuously from the washbasin tap.",
      category: "PLUMBING",
      status: "IN_PROGRESS",
      priority: "HIGH",
      userId: createdStudents[1].userId,
    },
    {
      title: "Wi-Fi Router Connection Drop",
      description: "Intermittent connection drop on Floor 3 corridor router.",
      category: "INTERNET",
      status: "RESOLVED",
      priority: "MEDIUM",
      resolvedAt: new Date(),
      userId: createdStudents[2].userId,
    },
  ];

  await prisma.maintenanceRequest.deleteMany({
    where: { title: { in: maintenanceSamples.map((request) => request.title) } },
  });
  for (const req of maintenanceSamples) {
    await prisma.maintenanceRequest.create({ data: req });
  }
  console.log(`  ✅ Sample maintenance tickets created (including SLA breach test item).`);

  // ── 7. Holidays ───────────────────────────────────────────────────────────
  await prisma.visitor.deleteMany({ where: { phone: { startsWith: "90000" } } });
  const visitorSamples = [
    { name: "Suresh Sharma", relation: "Father", purpose: "Fee documents", studentIndex: 0, hoursAgo: 2, inside: true },
    { name: "Kavita Iyer", relation: "Mother", purpose: "Health check-in", studentIndex: 4, hoursAgo: 4, inside: false },
    { name: "Rahul Mehta", relation: "Brother", purpose: "Drop parcel", studentIndex: 8, hoursAgo: 7, inside: false },
    { name: "Priya Nair", relation: "Friend", purpose: "Project discussion", studentIndex: 12, hoursAgo: 26, inside: false },
    { name: "Arjun Reddy", relation: "Guardian", purpose: "Local guardian visit", studentIndex: 16, hoursAgo: 1, inside: true },
    { name: "Neha Das", relation: "Sister", purpose: "Collect laundry bag", studentIndex: 20, hoursAgo: 5, inside: true },
  ];
  for (let i = 0; i < visitorSamples.length; i++) {
    const sample = visitorSamples[i];
    const inTime = new Date(Date.now() - sample.hoursAgo * 60 * 60 * 1000);
    await prisma.visitor.create({
      data: {
        name: sample.name,
        phone: `90000${String(10000 + i).slice(-5)}`,
        relation: sample.relation,
        purpose: sample.purpose,
        inTime,
        outTime: sample.inside ? null : new Date(inTime.getTime() + 90 * 60 * 1000),
        date: inTime,
        studentId: createdStudents[sample.studentIndex].id,
        loggedById: warden.id,
      },
    });
  }
  console.log("  ✅ Visitor log samples created.");

  const currentYear = new Date().getFullYear();
  const holidays = [
    { title: "Republic Day", date: new Date(`${currentYear}-01-26`), type: "PUBLIC", description: "National holiday" },
    { title: "Holi Festival", date: new Date(`${currentYear}-03-25`), type: "PUBLIC", description: "Festival of Colors" },
    { title: "Independence Day", date: new Date(`${currentYear}-08-15`), type: "PUBLIC", description: "National holiday" },
    { title: "Diwali Vacation", date: new Date(`${currentYear}-10-20`), type: "HOSTEL_SPECIFIC", description: "Hostel checkout permitted for 5 days" },
  ];

  await prisma.holiday.deleteMany({ where: { title: { in: holidays.map((holiday) => holiday.title) } } });
  for (const holiday of holidays) {
    await prisma.holiday.create({ data: holiday });
  }
  console.log(`  ✅ Holidays populated.`);

  console.log("\n🎉 Database seeding finished successfully!\n");
  console.log("Credentials:");
  console.log("  Admin:   admin@hostel.com   / Admin@1234");
  console.log("  Warden:  warden@hostel.com  / Warden@1234");
  console.log("  Student: student1@hostel.com / Student@1234");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
