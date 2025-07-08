export type Department = '물리과' | '화학과' | 'IT과';

export type RentalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface Equipment {
  id: string;
  name: string;
  department: Department;
  total_quantity: number;
  // available_quantity will be calculated based on rentals
}

export interface Rental {
  id: string;
  equipment_id: string;
  borrower_name: string;
  purpose: string;
  start_date: Date;
  end_date: Date;
  status: RentalStatus;
}
