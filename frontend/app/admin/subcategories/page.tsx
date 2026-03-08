"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff
} from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useDeleteDepartmentMutation, useDepartmentsQuery } from "@/features/departments/queries";
import type { Department } from "@/features/departments";

type SortOption = "name-asc" | "name-desc" | "newest" | "oldest";

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: departmentsResponse, isLoading, error, refetch } = useDepartmentsQuery({
    limit: 1000,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const deleteMutation = useDeleteDepartmentMutation();

  const departments: Department[] = departmentsResponse?.data || [];

  const filteredAndSortedDepartments = useMemo(() => {
    let result = departments.filter(dept =>
      dept.name.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return 0;
      }
    });

    return result;
  }, [departments, search, sortBy]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => setDeleteId(id);

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h2">Subcategories</Heading>
            <Text className="text-warm-gray-500">
              Manage your homepage subcategory spotlight sections.
            </Text>
          </div>
          <Link href="/admin/subcategories/new">
            <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </Link>
        </div>

        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-12 text-center">
            <Text className="text-warm-gray-500">Loading subcategories...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h2">Subcategories</Heading>
            <Text className="text-warm-gray-500">
              Manage your homepage subcategory spotlight sections.
            </Text>
          </div>
          <Link href="/admin/subcategories/new">
            <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </Link>
        </div>

        <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-12 text-center space-y-4">
            <Text className="text-warm-gray-500">
              {extractErrorMessage(error, "Failed to load subcategories")}
            </Text>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h2">Subcategories</Heading>
          <Text className="text-warm-gray-500">
            Manage your homepage subcategory spotlight sections.
          </Text>
        </div>
        <Link href="/admin/subcategories/new">
          <Button className="rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Subcategory
          </Button>
        </Link>
      </div>

      <Card className="border-warm-gray-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-warm-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-warm-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <Input
              placeholder="Search subcategories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-warm-gray-200 focus:ring-primary-500 rounded-lg h-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-warm-gray-400 font-medium hidden md:block">
              {filteredAndSortedDepartments.length} subcategories
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-warm-gray-200 bg-white h-10 px-4">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-warm-gray-400" />
                  <span className="text-sm font-medium text-warm-gray-700">Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-2 shadow-2xl border-warm-gray-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-2">Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-warm-gray-100" />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="newest" className="rounded-lg cursor-pointer py-2.5">
                    <span>Newest First</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest" className="rounded-lg cursor-pointer py-2.5">
                    <span>Oldest First</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc" className="rounded-lg cursor-pointer py-2.5">
                    <SortAsc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (A-Z)</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc" className="rounded-lg cursor-pointer py-2.5">
                    <SortDesc className="w-4 h-4 mr-2 text-warm-gray-400" />
                    <span>Name (Z-A)</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-gray-50/50 border-b border-warm-gray-100">
                <th className="py-3 px-4 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Department Name</th>
                <th className="py-3 px-4 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Parent Category</th>
                <th className="py-3 px-4 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Highlighted Subcats</th>
                <th className="py-3 px-4 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[10px] font-bold text-warm-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray-100">
              {filteredAndSortedDepartments.map((dept) => (
                <tr key={dept.id} className="hover:bg-warm-gray-50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <Text className="font-semibold text-warm-gray-900 group-hover:text-primary-700 transition-colors text-sm">
                          {dept.name}
                        </Text>
                        <Text className="text-[10px] text-warm-gray-400">Created {new Date(dept.createdAt).toLocaleDateString()}</Text>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="bg-white text-warm-gray-600 border-warm-gray-200 font-medium text-[10px]">
                      {dept.parentCategory?.name || "Unknown"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {dept.highlightedSubcategories.map((sub) => (
                        <Badge key={sub.id} className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-none text-[9px] px-1.5 py-0">
                          {sub.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {dept.isActive ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                        <Eye className="w-3 h-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-warm-gray-100 text-warm-gray-500 border-warm-gray-200 flex items-center gap-1 w-fit">
                        <EyeOff className="w-3 h-3" />
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-warm-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-warm-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 shadow-lg border-warm-gray-100">
                        <DropdownMenuLabel className="text-[10px] font-bold text-warm-gray-400 uppercase px-2 py-1.5">Options</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/subcategories/${dept.id}/edit`} className="rounded-lg cursor-pointer flex items-center gap-2 px-2 py-2">
                            <Edit2 className="w-4 h-4 text-warm-gray-400" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-warm-gray-100" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(dept.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg cursor-pointer flex items-center gap-2 px-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

              {filteredAndSortedDepartments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <LayoutGrid className="w-12 h-12 text-warm-gray-200 mx-auto mb-4" />
                    <Text className="text-warm-gray-500 font-medium">No subcategories found</Text>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete subcategory"
        description="Are you sure you want to delete this subcategory?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
