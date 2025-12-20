// Profile section showing account details.
"use client";

import { useState, useEffect } from "react";
import type { UpdateProfileData, ChangePasswordData } from "../api";
import { mockUser } from "@/dev/mocks/mockProfile";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateProfileSchema, changePasswordSchema } from "../schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
            <Input
              label="First Name *"
              {...register("firstName")}
              error={errors.firstName?.message}
            />

            <Input
              label="Last Name *"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email *"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <div className="pt-4">
            <Button type="submit" isLoading={isLoading} size="lg">
              Update Profile
            </Button>
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

          <Input
            label="Current Password *"
            type="password"
            {...registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
          />

          <Input
            label="New Password *"
            type="password"
            {...registerPassword("newPassword")}
            error={passwordErrors.newPassword?.message}
          />

          <Input
            label="Confirm New Password *"
            type="password"
            {...registerPassword("confirmPassword")}
            error={passwordErrors.confirmPassword?.message}
          />

          <div className="pt-4">
            <Button type="submit" isLoading={isPasswordLoading} size="lg">
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
