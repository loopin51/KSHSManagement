import EquipmentListClient from '@/components/EquipmentListClient';
import { getDepartments, getEquipment } from '@/lib/data';

export default function Home() {
  const allEquipment = getEquipment();
  const departments = getDepartments();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">장비 카탈로그</h1>
        <p className="text-muted-foreground mt-2">
          부서별 장비를 조회하고 대여할 장비를 선택하세요.
        </p>
      </div>
      <EquipmentListClient allEquipment={allEquipment} departments={departments} />
    </div>
  );
}
