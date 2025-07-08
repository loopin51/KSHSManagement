import type { Department, Equipment, Rental } from './types';

const departments: Department[] = ['물리과', '화학과', 'IT과'];

let equipment: Equipment[] = [
  { id: 'IT-LAPTOP-001', name: 'MacBook Pro 16"', department: 'IT과', total_quantity: 10 },
  { id: 'IT-LAPTOP-002', name: 'Dell XPS 15', department: 'IT과', total_quantity: 15 },
  { id: 'IT-MONITOR-001', name: 'LG UltraFine 4K', department: 'IT과', total_quantity: 20 },
  { id: 'CHEM-SPEC-001', name: '적외선 분광기', department: '화학과', total_quantity: 2 },
  { id: 'CHEM-HOOD-001', name: '흄 후드', department: '화학과', total_quantity: 5 },
  { id: 'CHEM-GLASS-001', name: '초정밀 비커 세트', department: '화학과', total_quantity: 50 },
  { id: 'PHYS-OSC-001', name: '오실로스코프', department: '물리과', total_quantity: 8 },
  { id: 'PHYS-LASER-001', name: '헬륨-네온 레이저', department: '물리과', total_quantity: 3 },
  { id: 'PHYS-SCALE-001', name: '정밀 전자 저울', department: '물리과', total_quantity: 12 },
  { id: 'IT-PROJECTOR-001', name: '4K 프로젝터', department: 'IT과', total_quantity: 4 },
];

let rentals: Rental[] = [
    {
        id: 'R001',
        equipment_id: 'IT-LAPTOP-001',
        borrower_name: '홍길동',
        purpose: '캡스톤 디자인 프로젝트',
        start_date: new Date('2024-08-05T09:00:00'),
        end_date: new Date('2024-08-10T17:00:00'),
        status: 'approved',
      },
      {
        id: 'R002',
        equipment_id: 'CHEM-SPEC-001',
        borrower_name: '김철수',
        purpose: '유기화학 실험',
        start_date: new Date('2024-08-08T10:00:00'),
        end_date: new Date('2024-08-12T13:00:00'),
        status: 'approved',
      },
      {
        id: 'R003',
        equipment_id: 'PHYS-OSC-001',
        borrower_name: '이영희',
        purpose: '전자기학 실험',
        start_date: new Date('2024-08-15T13:00:00'),
        end_date: new Date('2024-08-20T18:00:00'),
        status: 'pending',
      },
      {
        id: 'R004',
        equipment_id: 'IT-LAPTOP-001',
        borrower_name: '박지성',
        purpose: 'AI 학회 발표자료 준비',
        start_date: new Date('2024-08-18T09:00:00'),
        end_date: new Date('2024-08-22T12:00:00'),
        status: 'approved',
      },
      {
        id: 'R005',
        equipment_id: 'IT-MONITOR-001',
        borrower_name: '홍길동',
        purpose: '추가 모니터 요청',
        start_date: new Date('2024-08-05T09:00:00'),
        end_date: new Date('2024-08-10T17:00:00'),
        status: 'approved',
      },
];


export const getDepartments = () => departments;

export const getEquipment = () => equipment;

export const getEquipmentById = (id: string) => equipment.find(e => e.id === id);

export const getRentals = () => rentals;

export const getRentalsByEquipmentId = (equipmentId: string) => rentals.filter(r => r.equipment_id === equipmentId);

export function getAvailableQuantity(equipmentId: string, dateTime: Date): number {
    const item = getEquipmentById(equipmentId);
    if (!item) return 0;
  
    const overlappingRentals = rentals.filter(
      (rental) =>
        rental.equipment_id === equipmentId &&
        rental.status === 'approved' &&
        dateTime >= rental.start_date &&
        dateTime < rental.end_date
    );
  
    return item.total_quantity - overlappingRentals.length;
}

export function checkRentalCollision(equipmentIds: string[], startDate: Date, endDate: Date): { collision: boolean; message: string; conflictingItem?: string } {
    for (const id of equipmentIds) {
      const item = getEquipmentById(id);
      if (!item) continue;
  
      const checkPoints = [startDate];
      rentals.forEach(r => {
        if (r.equipment_id === id && r.status === 'approved' && r.start_date > startDate && r.start_date < endDate) {
            checkPoints.push(r.start_date);
        }
      });
      
      for (const point of checkPoints) {
        const concurrentRentals = rentals.filter(r =>
            r.equipment_id === id &&
            r.status === 'approved' &&
            point >= r.start_date &&
            point < r.end_date
          ).length;

        if (concurrentRentals >= item.total_quantity) {
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

export function addEquipment(newEquipment: Equipment): void {
    equipment.unshift(newEquipment);
}

let nextRentalId = 100;
export function createRental(rentalData: Omit<Rental, 'id' | 'status'>): Rental {
    const newRental: Rental = {
        ...rentalData,
        id: `R${nextRentalId++}`,
        status: 'pending',
    };
    rentals.push(newRental);
    return newRental;
}
