import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    setDoc,
    query,
    where,
    Timestamp,
    orderBy,
    DocumentData,
    QueryDocumentSnapshot,
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { Department, Equipment, Rental } from './types';
  import { format } from 'date-fns';
  
  const departments: Department[] = ['물리과', '화학과', 'IT과'];
  
  // --- Data Transformation Helpers ---
  const equipmentFromDoc = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Equipment => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      department: data.department,
      total_quantity: data.total_quantity,
    } as Equipment;
  };
  
  const rentalFromDoc = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Rental => {
    const data = doc.data();
    return {
      id: doc.id,
      equipment_id: data.equipment_id,
      borrower_name: data.borrower_name,
      purpose: data.purpose,
      start_date: (data.start_date as Timestamp).toDate(),
      end_date: (data.end_date as Timestamp).toDate(),
      status: data.status,
    } as Rental;
  };
  
  
  // --- Department Functions ---
  export const getDepartments = () => departments;
  
  
  // --- Equipment Functions ---
  export const getEquipment = async (): Promise<Equipment[]> => {
    try {
      const equipmentCol = collection(db, 'equipment');
      const equipmentSnapshot = await getDocs(query(equipmentCol, orderBy('name')));
      return equipmentSnapshot.docs.map(equipmentFromDoc);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      // In a real app, you might want to handle this more gracefully.
      // For now, we'll return an empty array and log the error.
      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 'failed-precondition'
      ) {
        console.warn(
          'Firestore indexes are not set up. Please create the required indexes in your Firebase console.'
        );
      }
      return [];
    }
  };
  
  export const getEquipmentById = async (id: string): Promise<Equipment | undefined> => {
    try {
      if (!id) return undefined;
      const equipmentDocRef = doc(db, 'equipment', id);
      const equipmentSnap = await getDoc(equipmentDocRef);
      if (equipmentSnap.exists()) {
        return equipmentFromDoc(equipmentSnap);
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching equipment by ID (${id}):`, error);
      return undefined;
    }
  };
  
  export const addEquipment = async (newEquipment: Equipment): Promise<void> => {
    try {
      const equipmentDocRef = doc(db, 'equipment', newEquipment.id);
      const { id, ...equipmentData } = newEquipment;
      await setDoc(equipmentDocRef, equipmentData);
    } catch (error) {
      console.error("Error adding equipment:", error);
      throw error;
    }
  };
  
  
  // --- Rental Functions ---
  export const getRentals = async (): Promise<Rental[]> => {
    try {
      const rentalsCol = collection(db, 'rentals');
      const rentalsSnapshot = await getDocs(query(rentalsCol, orderBy('start_date', 'desc')));
      return rentalsSnapshot.docs.map(rentalFromDoc);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 'failed-precondition'
      ) {
        console.warn(
          'Firestore indexes are not set up. Please create the required indexes in your Firebase console.'
        );
      }
      return [];
    }
  };
  
  export const getRentalsByEquipmentId = async (equipmentId: string): Promise<Rental[]> => {
    try {
      const rentalsCol = collection(db, 'rentals');
      const q = query(rentalsCol, where('equipment_id', '==', equipmentId));
      const rentalsSnapshot = await getDocs(q);
      return rentalsSnapshot.docs.map(rentalFromDoc);
    } catch (error) {
      console.error(`Error fetching rentals for equipment ID (${equipmentId}):`, error);
      return [];
    }
  };
  
  export async function getAvailableQuantity(equipmentId: string, dateTime: Date): Promise<number> {
      const item = await getEquipmentById(equipmentId);
      if (!item) return 0;
    
      const rentalsCol = collection(db, 'rentals');
      // Query for rentals that could be active at the given dateTime
      const q = query(
        rentalsCol,
        where('equipment_id', '==', equipmentId),
        where('status', 'in', ['approved', 'pending']),
        where('start_date', '<=', dateTime),
      );
      
      const snapshot = await getDocs(q);
      // Filter in memory for rentals that haven't ended yet
      const overlappingRentals = snapshot.docs
        .map(rentalFromDoc)
        .filter(rental => dateTime < rental.end_date);
    
      return item.total_quantity - overlappingRentals.length;
  }
  
  export async function checkRentalCollision(equipmentIds: string[], startDate: Date, endDate: Date): Promise<{ collision: boolean; message: string; conflictingItem?: string }> {
      for (const id of equipmentIds) {
        const item = await getEquipmentById(id);
        if (!item) continue;
    
        const rentalsCol = collection(db, 'rentals');
        // Find rentals that overlap with the requested period
        const q = query(
          rentalsCol,
          where('equipment_id', '==', id),
          where('status', 'in', ['approved', 'pending']),
          where('start_date', '<', endDate),
        );
        
        const snapshot = await getDocs(q);
        const potentialCollisions = snapshot.docs
          .map(rentalFromDoc)
          .filter(r => r.end_date > startDate);
        
        // Define points in time to check for availability
        const checkPoints = [startDate, ...potentialCollisions.map(r => r.start_date).filter(d => d > startDate && d < endDate)];
  
        for (const point of checkPoints) {
            const concurrentRentals = potentialCollisions.filter(
                r => point >= r.start_date && point < r.end_date
            ).length;
            
            if (item.total_quantity - concurrentRentals < 1) {
                return {
                  collision: true,
                  message: `"${item.name}"은(는) ${format(point, 'yyyy-MM-dd HH:mm')}에 대여 가능 수량을 초과합니다.`,
                  conflictingItem: item.name
                };
            }
        }
      }
    
      return { collision: false, message: "대여 가능합니다." };
  }
  
  export async function createRental(rentalData: Omit<Rental, 'id' | 'status'>): Promise<Rental> {
      const newRentalData = {
          ...rentalData,
          status: 'pending',
          start_date: Timestamp.fromDate(rentalData.start_date),
          end_date: Timestamp.fromDate(rentalData.end_date),
      };
      const rentalsCol = collection(db, 'rentals');
      const docRef = await addDoc(rentalsCol, newRentalData);
      
      return {
          ...rentalData,
          id: docRef.id,
          status: 'pending',
      };
  }
  