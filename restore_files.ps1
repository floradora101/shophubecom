$files = @(
    "frontend/app/admin/hero-slides/_components/ImagePicker.tsx",
    "frontend/app/admin/hero-slides/_components/Repeater.tsx",
    "frontend/app/admin/hero-slides/_components/index.ts",
    "frontend/components/ui/avatar.tsx",
    "frontend/components/ui/progress.tsx",
    "frontend/components/ui/separator.tsx",
    "frontend/components/ui/tabs.tsx",
    "frontend/features/admin/components/AdminFormPage.tsx",
    "frontend/features/admin/components/AdminListPage.tsx",
    "frontend/features/admin/components/AdminPageLayout.tsx",
    "frontend/features/admin/components/AdminSidebarContext.tsx",
    "frontend/lib/mock-data/mock-reviews.ts",
    "frontend/store/sidebar-store.ts",
    "frontend/app/(shop)/products/[slug]/components/WriteReviewModal.tsx"
)

foreach ($file in $files) {
    Write-Host "Restoring $file..."
    git show "f3b2a10:$file" | Out-File -FilePath temp_file.txt -Encoding UTF8
    Move-Item -Path temp_file.txt -Destination $file -Force
    Write-Host "Restored $file"
}
