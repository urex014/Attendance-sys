import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  ["CSC301", "Data Structures and Algorithms"],
  ["SEN301", "Object-Oriented Analysis and Design"],
  ["CSC303", "Database Management Systems"],
  ["SEN303", "Software Project Management"],
  ["CSC305", "Computer Architecture and Organization"],
  ["SEN305", "Web Application Development"],
  ["CSC307", "Automata Theory and Formal Languages"],
  ["SEN307", "Software Architecture and Design Patterns"],
  ["CSC308", "Operating Systems"],
  ["SEN304", "Mobile Application Development"],
  ["CSC309", "Artificial Intelligence"],
  ["SEN306", "Software Testing and Quality Assurance"],
  ["CSC311", "Data Communications and Networks"],
  ["SEN311", "Software Requirements Engineering"],
  ["CSC313", "Human-Computer Interaction"],
  ["SEN313", "Cloud Computing Architecture"],
  ["CSC315", "Compiler Construction"],
  ["SEN315", "Software Construction and Evolution"],
  ["CSC317", "Numerical Computations"],
  ["SEN317", "DevOps and Continuous Integration"],
  ["CSC319", "Cyber Security Fundamentals"],
  ["SEN319", "Enterprise Architecture"],
  ["CSC321", "Distributed Systems"],
  ["SEN321", "UI/UX Design for Software Engineers"],
  ["CSC399", "Industrial Training / SIWES"],
];

async function main() {
  for (const [courseCode, courseTitle] of courses) {
    await prisma.course.upsert({
      where: { courseCode },
      update: { courseTitle },
      create: {
        courseCode,
        courseTitle,
        lecturerId: null,
      },
    });
  }

  console.log("Courses seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });