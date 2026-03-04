-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentHighlightedSubcategory" (
    "departmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DepartmentHighlightedSubcategory_pkey" PRIMARY KEY ("departmentId","categoryId")
);

-- CreateIndex
CREATE INDEX "Department_parentCategoryId_idx" ON "Department"("parentCategoryId");

-- CreateIndex
CREATE INDEX "Department_isActive_idx" ON "Department"("isActive");

-- CreateIndex
CREATE INDEX "Department_createdAt_idx" ON "Department"("createdAt");

-- CreateIndex
CREATE INDEX "DepartmentHighlightedSubcategory_categoryId_idx" ON "DepartmentHighlightedSubcategory"("categoryId");

-- CreateIndex
CREATE INDEX "DepartmentHighlightedSubcategory_departmentId_sortOrder_idx" ON "DepartmentHighlightedSubcategory"("departmentId","sortOrder");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentHighlightedSubcategory" ADD CONSTRAINT "DepartmentHighlightedSubcategory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentHighlightedSubcategory" ADD CONSTRAINT "DepartmentHighlightedSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

