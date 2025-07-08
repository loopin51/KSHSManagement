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
  { id: 'EQ-001', data: { name: '오실로스코프 TDS2024C', department: '물리과', total_quantity: 5 } },
  { id: 'EQ-002', data: { name: '함수 발생기 AFG1022', department: '물리과', total_quantity: 3 } },
  { id: 'EQ-003', data: { name: '원심분리기 Combi-514R', department: '화학과', total_quantity: 2 } },
  { id: 'EQ-004', data: { name: 'pH 미터 ST3100-F', department: '화학과', total_quantity: 10 } },
  { id: 'EQ-005', data: { name: '고성능 노트북 LG Gram Pro', department: 'IT과', total_quantity: 8 } },
  { id: 'EQ-006', data: { name: 'VR 헤드셋 Meta Quest 3', department: 'IT과', total_quantity: 4 } },
  { id: 'EQ-007', data: { name: '3D 프린터 Ender 3 V2', department: 'IT과', total_quantity: 2 } },
];

const getDummyRentals = (): Omit<Rental, 'id'>[] => {
  const today = new Date();
  return [
    {
      equipment_id: 'EQ-001',
      borrower_name: '김물리',
      purpose: '양자역학 실험',
      start_date: addDays(today, -2),
      end_date: addDays(today, 2),
      status: 'approved',
    },
    {
      equipment_id: 'EQ-005',
      borrower_name: '이개발',
      purpose: '캡스톤 디자인 프로젝트',
      start_date: addDays(today, 1),
      end_date: addDays(today, 8),
      status: 'pending',
    },
    {
      equipment_id: 'EQ-004',
      borrower_name: '박화학',
      purpose: '유기화합물 분석',
      start_date: subDays(today, 10),
      end_date: subDays(today, 5),
      status: 'returned',
    },
    {
      equipment_id: 'EQ-003',
      borrower_name: '최연구',
      purpose: '졸업 연구',
      start_date: addDays(today, 3),
      end_date: addDays(today, 5),
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
