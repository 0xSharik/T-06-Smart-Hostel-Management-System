require('dotenv').config();

/**
 * prisma/seed.js — Database Seed File
 *
 * Room Layout (500 rooms — 10 Floors × 50 Rooms):
 *   Per floor room distribution:
 *     Rooms 01-22 → QUINT  (5-seater): 22 rooms × 10 floors = 220 rooms → 1100 beds
 *     Rooms 23-36 → QUAD   (4-seater): 14 rooms × 10 floors = 140 rooms →  560 beds
 *     Rooms 37-44 → TRIPLE (3-seater):  8 rooms × 10 floors =  80 rooms →  240 beds
 *     Rooms 45-48 → DOUBLE (2-seater):  4 rooms × 10 floors =  40 rooms →   80 beds
 *     Rooms 49-50 → SINGLE (1-seater):  2 rooms × 10 floors =  20 rooms →   20 beds
 *   ──────────────────────────────────────────────────────────────────────────
 *   TOTAL: 500 rooms | 2000 beds
 *
 * Reserved empty rooms (~20 rooms, ~80 beds removed):
 *   Rooms ending in 10 and 35 on each floor.
 *
 * Maintenance rooms (~5 rooms, ~20 beds removed):
 *   One specific room per odd floor.
 *
 * Assignable beds ≈ 2000 − 80 − 20 = ~1900 beds
 * → 1900 students assigned to rooms, ~100 on waiting list = 2000 total
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ── Room type helpers ─────────────────────────────────────────────────────────
function getRoomType(roomNum) {
  if (roomNum <= 22) return "QUINT";
  if (roomNum <= 36) return "QUAD";
  if (roomNum <= 44) return "TRIPLE";
  if (roomNum <= 48) return "DOUBLE";
  return "SINGLE";
}

function getCapacity(type) {
  return { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4, QUINT: 5 }[type];
}

function buildAmenities(type, floor) {
  const base = ["Bed", "Study Desk", "Wardrobe"];
  if (type === "SINGLE")  return [...base, "Attached Bathroom", "High-speed Wi-Fi", "Air Conditioning"];
  if (type === "DOUBLE")  return [...base, "Attached Bathroom", "High-speed Wi-Fi"];
  if (type === "TRIPLE")  return [...base, "High-speed Wi-Fi", "Shared Bathroom"];
  if (type === "QUAD")    return [...base, "High-speed Wi-Fi", "Shared Bathroom", "Common Lounge"];
  if (type === "QUINT")   return [...base, "High-speed Wi-Fi", "Shared Bathroom", "Common Lounge", "Balcony"];
  return base;
}

async function main() {
  console.log("🌱 Seeding database — 500 rooms (10 floors × 50) + 2000 students...");

  // Reset all assignments & clear old data for clean seed
  console.log("  ⏳ Wiping old transactional & room data...");
  await prisma.student.updateMany({ data: { roomId: null } });
  await prisma.studentProfileUpdateRequest.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.messFeedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany({ where: { role: "STUDENT" } });
  await prisma.room.deleteMany();
  console.log("  ✅ Wipe complete.");

  const saltRounds = 10;

  // ── 1. Admin ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", saltRounds);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hostel.com" },
    update: { name: "Admin System User" },
    create: {
      name: "Admin System User",
      email: "admin@hostel.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin:", admin.email);

  // ── 2. Warden ─────────────────────────────────────────────────────────────
  const wardenPassword = await bcrypt.hash("Warden@1234", saltRounds);
  const warden = await prisma.user.upsert({
    where: { email: "warden@hostel.com" },
    update: { name: "Mr. Ramesh Kumar (Chief Warden)" },
    create: {
      name: "Mr. Ramesh Kumar (Chief Warden)",
      email: "warden@hostel.com",
      password: wardenPassword,
      role: "WARDEN",
    },
  });
  console.log("  ✅ Warden:", warden.email);

  // ── 3. Create Rooms (10 Floors × 50 Rooms = 500 total) ───────────────────
  const totalFloors    = 10;
  const roomsPerFloor  = 50;

  const createdRooms       = [];
  const emptyRoomNos       = new Set(); // intentionally vacant
  const maintenanceRoomNos = new Set(); // under maintenance

  // Maintenance: one room per odd floor (5 rooms total)
  const maintenanceSpec = new Set(["110", "325", "540", "710", "925"]);

  // Empty rooms: rooms ending in 10 and 35 on each floor (~20 rooms)
  for (let f = 1; f <= totalFloors; f++) {
    emptyRoomNos.add(`${f}10`);
    emptyRoomNos.add(`${f}35`);
  }
  // A few extra empty rooms on floors 2, 4, 6, 8 for variety
  ["205", "415", "620", "830"].forEach(r => emptyRoomNos.add(r));

  console.log("  ⏳ Creating rooms (this may take a moment)...");

  for (let floor = 1; floor <= totalFloors; floor++) {
    for (let r = 1; r <= roomsPerFloor; r++) {
      const roomNo          = `${floor}${r < 10 ? "0" + r : r}`;
      const type            = getRoomType(r);
      const capacity        = getCapacity(type);
      const underMaintenance = maintenanceSpec.has(roomNo);

      if (underMaintenance) maintenanceRoomNos.add(roomNo);

      const room = await prisma.room.upsert({
        where: { roomNo },
        update: {
          floor,
          type,
          capacity,
          occupancy: 0,
          status: underMaintenance ? "MAINTENANCE" : "AVAILABLE",
          amenities: buildAmenities(type, floor),
        },
        create: {
          roomNo,
          floor,
          type,
          capacity,
          occupancy: 0,
          status: underMaintenance ? "MAINTENANCE" : "AVAILABLE",
          amenities: buildAmenities(type, floor),
        },
      });
      createdRooms.push(room);
    }
    process.stdout.write(`\r     Floor ${floor}/${totalFloors} done...`);
  }

  const totalBeds = createdRooms.reduce((s, r) => s + r.capacity, 0);
  console.log(`\n  ✅ ${createdRooms.length} rooms created | ${totalBeds} total beds`);
  console.log(`     Distribution: 220×QUINT(5) 140×QUAD(4) 80×TRIPLE(3) 40×DOUBLE(2) 20×SINGLE(1)`);
  console.log(`     Maintenance: ${maintenanceRoomNos.size} | Empty (reserved): ${emptyRoomNos.size}`);

  // Reset all room assignments before re-seeding students
  await prisma.student.updateMany({ data: { roomId: null } });

  // ── 4. Create 2000 Students ────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@1234", saltRounds);

  const courses = [
    "B.Tech CSE", "B.Tech ECE", "B.Tech ME",
    "B.Tech CE",  "B.Tech EE",  "B.Tech Civil", "B.Tech IT",
  ];
  const firstNames = [
    "Aarav", "Aditi", "Kabir",    "Meera",   "Rohan",
    "Ananya","Ishaan","Nisha",    "Vivaan",  "Sanya",
    "Arjun", "Priya", "Vikram",   "Deepika", "Siddharth",
    "Kartik","Sneha", "Rahul",    "Pooja",   "Ajay",
    "Riya",  "Dev",   "Shreya",   "Karan",   "Divya",
  ];
  const lastNames = [
    "Sharma", "Patel",  "Kumar",  "Reddy",  "Nair",
    "Singh",  "Iyer",   "Das",    "Mehta",  "Roy",
    "Agarwal","Gupta",  "Khan",   "Mishra", "Verma",
    "Joshi",  "Pillai", "Rao",    "Shah",   "Tiwari",
  ];

  // Assignable rooms: not maintenance, not intentionally empty
  const assignableRooms = createdRooms.filter(
    r => r.status === "AVAILABLE" && !emptyRoomNos.has(r.roomNo)
  );

  console.log(`\n  ⏳ Seeding 2000 students (assignable beds: ${assignableRooms.reduce((s, r) => s + r.capacity, 0)})...`);

  let roomIndex = 0;

  for (let i = 1; i <= 2000; i++) {
    const rollNo = `ST2024${1000 + i}`;
    const email  = `student${i}@hostel.com`;
    const name   = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const course = courses[i % courses.length];
    const year   = (i % 4) + 1;
    const phone  = `98765${10000 + i}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { name, email, password: studentPassword, role: "STUDENT" },
    });

    // Find next room with available capacity
    let assignedRoom = null;
    while (roomIndex < assignableRooms.length) {
      if (assignableRooms[roomIndex].occupancy < assignableRooms[roomIndex].capacity) {
        assignedRoom = assignableRooms[roomIndex];
        break;
      }
      roomIndex++;
    }

    const student = await prisma.student.upsert({
      where: { rollNo },
      update: {
        course,
        year,
        phone,
        parentName: `Parent of ${firstNames[i % firstNames.length]}`,
        parentPhone: `9112345${100 + (i % 900)}`,
        roomId: assignedRoom ? assignedRoom.id : null,
      },
      create: {
        rollNo,
        course,
        year,
        phone,
        parentName: `Parent of ${firstNames[i % firstNames.length]}`,
        parentPhone: `9112345${100 + (i % 900)}`,
        userId: user.id,
        roomId: assignedRoom ? assignedRoom.id : null,
      },
    });

    if (assignedRoom) {
      assignedRoom.occupancy += 1;
      if (assignedRoom.occupancy === assignedRoom.capacity) {
        assignedRoom.status = "FULL";
      } else {
        assignedRoom.status = "OCCUPIED";
      }
    }

    if (i % 200 === 0) {
      process.stdout.write(`     Progress: ${i}/2000 students...`);
    }
  }

  // Update room occupancy counters in the database
  console.log("\n  ⏳ Syncing room occupancy to database...");
  for (const r of assignableRooms) {
    await prisma.room.update({
      where: { id: r.id },
      data: {
        occupancy: r.occupancy,
        status: r.occupancy === 0 ? "AVAILABLE" : r.occupancy === r.capacity ? "FULL" : "OCCUPIED",
      },
    });
  }

  const assignedCount = await prisma.student.count({ where: { roomId: { not: null } } });
  const waitingCount  = await prisma.student.count({ where: { roomId: null } });

  console.log(`  ✅ 2000 student records seeded`);
  console.log(`     Assigned to rooms: ${assignedCount}`);
  console.log(`     Waiting list (no room): ${waitingCount}`);

  // ── 5. Seed Mess Menu (28 slots: 7 days × 4 meals) ───────────────────────
  console.log("  ⏳ Seeding weekly mess menu...");
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const mealTypes = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
  const menuItems = {
    BREAKFAST: ["Masala Dosa, Sambhar", "Poha, Jalebi", "Aloo Paratha, Curd", "Idli Vadha", "Bread Butter, Eggs"],
    LUNCH:     ["Rice, Dal Tadka, Paneer, Roti", "Veg Biryani, Raita", "Rajma Chawal, Roti, Salad", "Chole Bhature"],
    SNACK:     ["Samosa, Tea", "Kachori, Coffee", "Veg Sandwich, Tea", "Pakora, Tea", "Pav Bhaji, Milk"],
    DINNER:    ["Roti, Dal Makhani, Mix Veg, Rice", "Jeera Rice, Egg Curry, Roti", "Kadai Chicken/Paneer, Roti, Rice"],
  };

  let menuSlots = 0;
  for (const day of days) {
    for (const mealType of mealTypes) {
      const items = menuItems[mealType];
      const selectedItem = [items[Math.floor(Math.random() * items.length)]];

      await prisma.messMenu.upsert({
        where: { day_mealType: { day, mealType } },
        update: { items: selectedItem },
        create: { day, mealType, items: selectedItem },
      });
      menuSlots++;
    }
  }
  console.log(`  ✅ ${menuSlots} mess menu slots populated.`);

  // ── 6. Mess Feedback Samples ─────────────────────────────────────────────
  console.log("  ⏳ Creating mess feedbacks...");
  const allStudents = await prisma.student.findMany({ take: 30 });
  const menus       = await prisma.messMenu.findMany({ take: 10 });

  for (const stud of allStudents) {
    const randomMenu = menus[Math.floor(Math.random() * menus.length)];
    await prisma.messFeedback.create({
      data: {
        rating: (stud.year % 3) + 3, // 3 to 5 stars
        comment: `Overall good, enjoyed the ${randomMenu.items[0]}`,
        userId: stud.userId,
        messMenuId: randomMenu.id,
      },
    });
  }
  console.log("  ✅ Mess feedback samples created.");

  // ── 7. Maintenance Tickets ───────────────────────────────────────────────
  console.log("  ⏳ Creating maintenance requests...");
  const maintStudents = await prisma.student.findMany({ where: { roomId: { not: null } }, take: 10 });
  const categories    = ["ELECTRICAL", "PLUMBING", "FURNITURE", "CLEANING", "INTERNET", "AC"];

  for (let i = 0; i < maintStudents.length; i++) {
    const stud = maintStudents[i];
    const cat  = categories[i % categories.length];

    await prisma.maintenanceRequest.create({
      data: {
        title: `${cat.charAt(0) + cat.slice(1).toLowerCase()} issue in Room ${stud.roomId ? "allocated" : "N/A"}`,
        description: `Please resolve the issue with the ${cat.toLowerCase()} fitting as soon as possible.`,
        category: cat,
        status: i % 3 === 0 ? "PENDING" : i % 3 === 1 ? "IN_PROGRESS" : "RESOLVED",
        priority: i % 2 === 0 ? "HIGH" : "MEDIUM",
        userId: stud.userId,
        roomId: stud.roomId,
        createdAt: i === 0 ? new Date(Date.now() - 50 * 3600 * 1000) : new Date(), // first one breaches SLA (48h)
      },
    });
  }
  console.log("  ✅ Maintenance tickets created (includes SLA breach test).");

  // ── 8. Visitor Logs ──────────────────────────────────────────────────────
  console.log("  ⏳ Creating visitor logs...");
  const visitorStudents = await prisma.student.findMany({ take: 5 });
  for (let i = 0; i < visitorStudents.length; i++) {
    const stud = visitorStudents[i];
    await prisma.visitor.create({
      data: {
        name: `Visitor ${i + 1}`,
        phone: `912345678${i}`,
        relation: i % 2 === 0 ? "Father" : "Guardian",
        purpose: "Weekend visit",
        studentId: stud.id,
        loggedById: warden.id,
      },
    });
  }
  console.log("  ✅ Visitor log samples created.");

  // ── 9. Holidays ──────────────────────────────────────────────────────────
  console.log("  ⏳ Seeding holidays...");
  const holidayList = [
    { title: "Independence Day", date: new Date("2026-08-15"), type: "PUBLIC" },
    { title: "Gandhi Jayanti", date: new Date("2026-10-02"), type: "PUBLIC" },
    { title: "Hostel Foundation Day", date: new Date("2026-11-10"), type: "HOSTEL_SPECIFIC" },
  ];
  for (const h of holidayList) {
    await prisma.holiday.create({ data: h });
  }
  console.log("  ✅ Holidays populated.");

  console.log("\n🎉 Database seeding finished successfully!");
  console.log("\nCredentials:");
  console.log("  Admin:   admin@hostel.com    / Admin@1234");
  console.log("  Warden:  warden@hostel.com   / Warden@1234");
  console.log("  Student: student1@hostel.com / Student@1234");

  console.log("\nRoom summary:");
  console.log(`  Total rooms : ${createdRooms.length} (${totalFloors} floors × ${roomsPerFloor} rooms)`);
  console.log(`  Total beds  : ${totalBeds}`);
  console.log(`  Types       : 220×QUINT(5) | 140×QUAD(4) | 80×TRIPLE(3) | 40×DOUBLE(2) | 20×SINGLE(1)`);
  console.log(`  Maintenance : ${maintenanceRoomNos.size} rooms | Empty (reserved): ${emptyRoomNos.size} rooms`);

  console.log("\nStudent summary:");
  console.log(`  Total       : 2000`);
  console.log(`  Assigned    : ${assignedCount}`);
  console.log(`  Waiting list: ${waitingCount}`);
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
