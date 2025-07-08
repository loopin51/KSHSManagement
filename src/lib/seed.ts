import {
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Equipment, Rental } from './types';
import { addDays, subDays } from 'date-fns';

const dummyEquipment: { id: string; data: Omit<Equipment, 'id'> }[] = [
  { id: 'EQ-PHY-001', data: { name: '오실로스코프 TDS2024C', department: '물리과', total_quantity: 5 } },
  { id: 'EQ-PHY-002', data: { name: '함수 발생기 AFG1022', department: '물리과', total_quantity: 3 } },
  { id: 'EQ-PHY-003', data: { name: '디지털 멀티미터 DMM4050', department: '물리과', total_quantity: 10 } },
  { id: 'EQ-PHY-004', data: { name: 'DC 파워 서플라이 E3631A', department: '물리과', total_quantity: 4 } },
  { id: 'EQ-CHM-001', data: { name: '원심분리기 Combi-514R', department: '화학과', total_quantity: 2 } },
  { id: 'EQ-CHM-002', data: { name: 'pH 미터 ST3100-F', department: '화학과', total_quantity: 10 } },
  { id: 'EQ-CHM-003', data: { name: '마그네틱 교반기 PC-420D', department: '화학과', total_quantity: 8 } },
  { id: 'EQ-CHM-004', data: { name: '전자 저울 Explorer EX224G', department: '화학과', total_quantity: 3 } },
  { id: 'EQ-IT-001', data: { name: '고성능 노트북 LG Gram Pro', department: 'IT과', total_quantity: 8 } },
  { id: 'EQ-IT-002', data: { name: 'VR 헤드셋 Meta Quest 3', department: 'IT과', total_quantity: 4 } },
  { id: 'EQ-IT-003', data: { name: '3D 프린터 Ender 3 V2', department: 'IT과', total_quantity: 2 } },
  { id: 'EQ-IT-004', data: { name: '로지텍 웹캠 C922 Pro', department: 'IT과', total_quantity: 15 } },
  { id: 'EQ-IT-005', data: { name: '와콤 드로잉 태블릿 Intuos Pro', department: 'IT과', total_quantity: 5 } },
];

const getDummyRentals = (): Omit<Rental, 'id'>[] => {
  const today = new Date();
  const setTime = (date: Date, hours: number, minutes: number) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  return [
    // --- Current & Overlapping Rentals ---
    { // Currently active
      equipment_id: 'EQ-PHY-001',
      borrower_name: '김물리',
      purpose: '양자역학 실험',
      start_date: setTime(subDays(today, 2), 9, 0),
      end_date: setTime(addDays(today, 2), 18, 0),
      status: 'approved',
    },
    { // Also currently active, different item
      equipment_id: 'EQ-IT-002',
      borrower_name: '최가상',
      purpose: 'VR 인터페이스 연구',
      start_date: setTime(subDays(today, 1), 14, 0),
      end_date: setTime(addDays(today, 1), 12, 0),
      status: 'approved',
    },
    { // Pending, starts today
      equipment_id: 'EQ-IT-001',
      borrower_name: '이개발',
      purpose: '캡스톤 디자인 프로젝트 중간 발표',
      start_date: setTime(today, 13, 0),
      end_date: setTime(today, 17, 0),
      status: 'pending',
    },
    { // Fully book out the centrifuges
      equipment_id: 'EQ-CHM-001',
      borrower_name: '박화학',
      purpose: '샘플 분리',
      start_date: setTime(today, 9, 0),
      end_date: setTime(today, 11, 30),
      status: 'approved',
    },
    { // The other centrifuge
      equipment_id: 'EQ-CHM-001',
      borrower_name: '정분석',
      purpose: '단백질 정제',
      start_date: setTime(today, 10, 0),
      end_date: setTime(today, 15, 0),
      status: 'pending',
    },

    // --- Future Rentals ---
    { // A pending rental for next week
      equipment_id: 'EQ-IT-001',
      borrower_name: '이개발',
      purpose: '캡스톤 디자인 프로젝트 최종 시연',
      start_date: setTime(addDays(today, 7), 9, 0),
      end_date: setTime(addDays(today, 14), 18, 0),
      status: 'pending',
    },
    { // A long-term rental
      equipment_id: 'EQ-PHY-002',
      borrower_name: '오장기',
      purpose: '장기 파동 관찰 실험',
      start_date: setTime(addDays(today, 3), 10, 0),
      end_date: setTime(addDays(today, 33), 17, 0),
      status: 'approved',
    },

    // --- Past Rentals ---
    { // A completed/returned rental
      equipment_id: 'EQ-CHM-002',
      borrower_name: '박화학',
      purpose: '유기화합물 분석',
      start_date: setTime(subDays(today, 10), 9, 0),
      end_date: setTime(subDays(today, 5), 18, 0),
      status: 'returned',
    },
    { // Another returned one
      equipment_id: 'EQ-IT-005',
      borrower_name: '나디자',
      purpose: '포스터 디자인',
      start_date: setTime(subDays(today, 8), 11, 0),
      end_date: setTime(subDays(today, 6), 16, 0),
      status: 'returned',
    },

    // --- Rejected Rental ---
    {
      equipment_id: 'EQ-CHM-001', // Try to book the centrifuge again in the past
      borrower_name: '최연구',
      purpose: '졸업 연구',
      start_date: setTime(subDays(today, 4), 9, 0),
      end_date: setTime(subDays(today, 2), 18, 0),
      status: 'rejected',
    },
  ];
};


async function deleteCollection(collectionName: string) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        return;
    }
    const deletePromises = snapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
    await Promise.all(deletePromises);
    console.log(`All documents in collection '${collectionName}' have been deleted.`);
}

export const seedDatabase = async () => {
  try {
    console.log('Resetting and seeding database...');
    
    // Delete existing data
    await deleteCollection('equipment');
    await deleteCollection('rentals');

    // Seed new data
    console.log('Seeding equipment...');
    const equipmentPromises = dummyEquipment.map(eq => setDoc(doc(db, 'equipment', eq.id), eq.data));
    await Promise.all(equipmentPromises);
    console.log(`${dummyEquipment.length} equipment items seeded.`);

    console.log('Seeding rentals...');
    const dummyRentals = getDummyRentals();
    const rentalPromises = dummyRentals.map(rental =>
      addDoc(collection(db, 'rentals'), {
        ...rental,
        start_date: Timestamp.fromDate(rental.start_date),
        end_date: Timestamp.fromDate(rental.end_date),
      })
    );
    await Promise.all(rentalPromises);
    console.log(`${dummyRentals.length} rental records seeded.`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
