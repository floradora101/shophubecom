// Profile section showing account details.
"use client";

import { useState, useEffect } from "react";
import type { UpdateProfileData, ChangePasswordData } from "../api";
import { mockUser } from "@/dev/mocks/mockProfile";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProfileSchema, changePasswordSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { extractErrorMessage } from "@/lib/utils/error-handler";

export function ProfileAccountDetails() {
  const user = mockUser;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(updateProfileSchema) as any,
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Initialize form with mock user data
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (_data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Mock update - just simulate success
      // TODO: Replace with actual API call: await profileApi.updateProfile(_data);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        extractErrorMessage(err, "Failed to update profile. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(changePasswordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const onPasswordSubmit = async (_data: ChangePasswordData) => {
    try {
      setIsPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(false);

      // Mock password update - just simulate success
      // TODO: Replace with actual API call: await profileApi.changePassword(_data);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPasswordSuccess(true);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        extractErrorMessage(err, "Failed to change password. Please try again.")
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Profile Details Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Account Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="First Name"
              required
              error={errors.firstName?.message}
            >
              <Input {...register("firstName")} error={!!errors.firstName} />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName?.message}
            >
              <Input {...register("lastName")} error={!!errors.lastName} />
            </FormField>
          </div>

          <FormField label="Email" required error={errors.email?.message}>
            <Input type="email" {...register("email")} error={!!errors.email} />
          </FormField>

          <div className="pt-4">
            <LoadingButton type="submit" loading={isLoading} size="lg">
              Update Profile
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Change Password
        </h2>

        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="space-y-4"
        >
          {passwordError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Password changed successfully!
              </AlertDescription>
            </Alert>
          )}

          <FormField
            label="Current Password"
            required
            error={passwordErrors.currentPassword?.message}
          >
            <Input
              type="password"
              {...registerPassword("currentPassword")}
              error={!!passwordErrors.currentPassword}
            />
          </FormField>

          <FormField
            label="New Password"
            required
            error={passwordErrors.newPassword?.message}
          >
            <Input
              type="password"
              {...registerPassword("newPassword")}
              error={!!passwordErrors.newPassword}
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
            />
          </FormField>

          <div className="pt-4">
            <LoadingButton type="submit" loading={isPasswordLoading} size="lg">
              Change Password
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
