"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Department, Equipment } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Laptop, Search, TestTube } from 'lucide-react';

interface EquipmentListClientProps {
  allEquipment: (Equipment & { available_quantity: number })[];
  departments: Department[];
}

const departmentIcons: Record<Department, React.ReactNode> = {
  'IT과': <Laptop className="h-4 w-4 mr-2" />,
  '화학과': <FlaskConical className="h-4 w-4 mr-2" />,
  '물리과': <TestTube className="h-4 w-4 mr-2" />,
};

export default function EquipmentListClient({ allEquipment, departments }: EquipmentListClientProps) {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(item => {
      const departmentMatch = selectedDepartment === 'all' || item.department === selectedDepartment;
      const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return departmentMatch && searchMatch;
    });
  }, [allEquipment, selectedDepartment, searchQuery]);

  const handleSelect = (id: string, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(id);
    } else {
      newSelectedItems.delete(id);
    }
    setSelectedItems(newSelectedItems);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if(checked) {
      const allIds = new Set(filteredEquipment.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  }

  const handleRentalRequest = () => {
    if (selectedItems.size > 0) {
      const query = new URLSearchParams({
        items: Array.from(selectedItems).join(','),
      }).toString();
      router.push(`/rentals/new?${query}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>장비 목록</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="ID 또는 이름으로 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select onValueChange={(value: Department | 'all') => setSelectedDepartment(value)} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 부서</SelectItem>
                {departments.map(dep => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    checked={selectedItems.size > 0 && selectedItems.size === filteredEquipment.length}
                    aria-label="모두 선택"
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className="text-right">총 수량</TableHead>
                <TableHead className="text-right">대여 가능</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(item => {
                  const availableQuantity = item.available_quantity;
                  return (
                    <TableRow key={item.id} data-state={selectedItems.has(item.id) ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={checked => handleSelect(item.id, Boolean(checked))}
                          aria-label={`${item.name} 선택`}
                          disabled={availableQuantity <= 0}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {departmentIcons[item.department]}
                          {item.department}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.total_quantity}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={availableQuantity > 0 ? 'default' : 'destructive'} className={availableQuantity > 0 ? 'bg-green-100 text-green-800' : ''}>
                          {availableQuantity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleRentalRequest} disabled={selectedItems.size === 0}>
            {selectedItems.size}개 장비 대여 신청
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
