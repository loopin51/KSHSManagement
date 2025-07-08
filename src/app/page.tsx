import EquipmentListClient from '@/components/EquipmentListClient';
import { getDepartments, getEquipment, getRentals } from '@/lib/data';

export default async function Home() {
  const allEquipment = await getEquipment();
  const allRentals = await getRentals();
  const departments = getDepartments();
  const today = new Date();

  const equipmentWithAvailability = allEquipment.map((item) => {
    const rentedQuantity = allRentals.filter(
      (rental) =>
        rental.equipment_id === item.id &&
        (rental.status === 'approved' || rental.status === 'pending') &&
        today >= rental.start_date &&
        today < rental.end_date
    ).length;

    return {
      ...item,
      available_quantity: item.total_quantity - rentedQuantity,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">장비 카탈로그</h1>
        <p className="text-muted-foreground mt-2">
          부서별 장비를 조회하고 대여할 장비를 선택하세요.
        </p>
      </div>
      <EquipmentListClient allEquipment={equipmentWithAvailability} departments={departments} />
    </div>
  );
}
