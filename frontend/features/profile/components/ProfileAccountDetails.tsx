// Profile section showing account details.
"use client";

import { useEffect } from "react";
import type { UpdateProfileData, ChangePasswordData } from "../api";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProfileSchema, changePasswordSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { Heading, Text } from "@/components/ui/typography";
import { User, Lock, Mail, Shield, ShieldCheck, Bell } from "lucide-react";
import { useProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from "../queries";

export function ProfileAccountDetails() {
  const { data: profileResponse, isLoading: isProfileLoading } = useProfileQuery();
  const user = profileResponse?.data;
  
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileData>({
    resolver: yupResolver(updateProfileSchema) as Resolver<UpdateProfileData>,
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Initialize form with real user data when available
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileData) => {
    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordData>({
    resolver: yupResolver(changePasswordSchema) as Resolver<ChangePasswordData>,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }, {
      onSuccess: () => resetPassword()
    });
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-10" aria-hidden="true">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <SkeletonBlock className="h-20 rounded-2xl" />
            <div className="space-y-4">
              <SkeletonBlock className="h-16 rounded-2xl" />
              <SkeletonBlock className="h-16 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <SkeletonBlock className="h-64 rounded-2xl" />
            <SkeletonBlock className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Information & Help */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-2">
            <Heading level="h4" className="text-xl font-bold tracking-tight">Security & Settings</Heading>
            <Text className="text-muted-fg text-sm font-medium leading-relaxed">
              Maintain your account security and update your personal information to keep your profile current.
            </Text>
          </div>

          <div className="space-y-4">
            {[
              { icon: ShieldCheck, title: "Account Verified", desc: "Your identity is confirmed" },
              { icon: Mail, title: "Primary Email", desc: user?.email ?? "" },
              { icon: Bell, title: "Notifications", desc: "Email alerts are active" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-muted/30 border border-border/20">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-fg text-sm">{item.title}</p>
                  <p className="text-xs text-muted-fg font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Details Section */}
          <div className="rounded-2xl border border-border/40 bg-surface-muted/20 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-fg tracking-tight">Personal Information</h2>
                <p className="text-xs text-muted-fg font-medium">Your public profile data</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  label="First Name"
                  required
                  error={errors.firstName?.message}
                >
                  <Input
                    {...register("firstName")}
                    error={!!errors.firstName}
                    className="h-12 rounded-xl border-border/60 bg-surface-muted/20 focus:bg-white transition-all"
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  required
                  error={errors.lastName?.message}
                >
                  <Input
                    {...register("lastName")}
                    error={!!errors.lastName}
                    className="h-12 rounded-xl border-border/60 bg-surface-muted/20 focus:bg-white transition-all"
                  />
                </FormField>
              </div>

              <div className="pt-4">
                <LoadingButton
                  type="submit"
                  loading={updateProfileMutation.isPending}
                  className="rounded-xl h-12 px-8 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary-500/10"
                >
                  Save Profile Changes
                </LoadingButton>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="rounded-2xl border border-border/40 bg-surface-muted/20 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-fg tracking-tight">Security & Password</h2>
                <p className="text-xs text-muted-fg font-medium">Update your login credentials</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmitPassword(onPasswordSubmit)}
              className="space-y-6"
            >
              <FormField
                label="Current Password"
                required
                error={passwordErrors.currentPassword?.message}
              >
                <Input
                  type="password"
                  {...registerPassword("currentPassword")}
                  error={!!passwordErrors.currentPassword}
                  className="h-12 rounded-xl border-border/60 bg-surface-muted/20 focus:bg-white transition-all"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  label="New Password"
                  required
                  error={passwordErrors.newPassword?.message}
                >
                  <Input
                    type="password"
                    {...registerPassword("newPassword")}
                    error={!!passwordErrors.newPassword}
                    className="h-12 rounded-xl border-border/60 bg-surface-muted/20 focus:bg-white transition-all"
                  />
                </FormField>

                <FormField
                  label="Confirm New Password"
                  required
                  error={passwordErrors.confirmPassword?.message}
                >
                  <Input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    error={!!passwordErrors.confirmPassword}
                    className="h-12 rounded-xl border-border/60 bg-surface-muted/20 focus:bg-white transition-all"
                  />
                </FormField>
              </div>

              <div className="pt-4">
                <LoadingButton
                  type="submit"
                  loading={changePasswordMutation.isPending}
                  className="rounded-xl h-12 px-8 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-amber-500/10 bg-amber-600 hover:bg-amber-700 border-none"
                >
                  Update Password
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

