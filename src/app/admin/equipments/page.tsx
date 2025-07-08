"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getEquipment, getDepartments, addEquipment, getEquipmentById } from "@/lib/data";
import type { Department, Equipment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const equipmentSchema = z.object({
  id: z.string().trim().min(1, "ID를 입력해주세요."),
  name: z.string().trim().min(1, "장비명을 입력해주세요."),
  department: z.enum(['물리과', '화학과', 'IT과'], {
    required_error: "부서를 선택해주세요.",
  }),
  total_quantity: z.coerce.number().min(1, "수량은 1 이상이어야 합니다."),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export default function AdminEquipmentsPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const departments = getDepartments();
  const { toast } = useToast();

  const fetchEquipment = async () => {
    setIsLoading(true);
    const data = await getEquipment();
    setEquipmentList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      id: "",
      name: "",
      department: undefined,
      total_quantity: 1,
    },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = form;

  const onSubmit = async (data: EquipmentFormValues) => {
    const existing = await getEquipmentById(data.id);
    if (existing) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이미 존재하는 장비 ID입니다.",
      });
      return;
    }

    try {
      await addEquipment(data as Equipment);
      await fetchEquipment(); // Refetch the list
      setIsDialogOpen(false);
      reset();
      toast({
        title: "성공",
        description: `"${data.name}" 장비가 추가되었습니다.`,
        className: "bg-green-100 text-green-800",
      });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "오류",
            description: "장비 추가 중 오류가 발생했습니다.",
        });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">장비 관리</h1>
          <p className="text-muted-foreground">새로운 장비를 추가하거나 기존 장비를 수정/삭제합니다.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 장비 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>새 장비 추가</DialogTitle>
              <DialogDescription>
                추가할 장비의 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <form id="add-equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="id">ID</Label>
                <Input id="id" {...register("id")} />
                {errors.id && <p className="pt-1 text-sm text-destructive">{errors.id.message}</p>}
              </div>
              <div>
                <Label htmlFor="name">이름</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="pt-1 text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="department">부서</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="부서를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dep => (
                          <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && <p className="pt-1 text-sm text-destructive">{errors.department.message}</p>}
              </div>
              <div>
                <Label htmlFor="total_quantity">총 수량</Label>
                <Input id="total_quantity" type="number" {...register("total_quantity")} />
                {errors.total_quantity && <p className="pt-1 text-sm text-destructive">{errors.total_quantity.message}</p>}
              </div>
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button type="submit" form="add-equipment-form" disabled={isSubmitting}>
                {isSubmitting ? "추가하는 중..." : "추가하기"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className="text-right">총 수량</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
              ) : equipmentList.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell className="text-right">{item.total_quantity}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>수정</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">삭제</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
