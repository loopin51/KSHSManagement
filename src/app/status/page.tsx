import AvailabilityView from '@/components/AvailabilityView';
import { getEquipment, getRentals } from '@/lib/data';

export default function StatusPage() {
  const rentals = getRentals();
  const equipment = getEquipment();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">장비 사용 현황</h1>
        <p className="text-muted-foreground mt-2">
          캘린더 또는 타임라인으로 장비 대여 현황을 확인하세요.
        </p>
      </div>
      <AvailabilityView rentals={rentals} equipment={equipment} />
    </div>
  );
}
