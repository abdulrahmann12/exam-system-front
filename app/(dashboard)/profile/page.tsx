"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import type { UpdateProfileRequest } from "@/types/user";

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateProfile(form);
      await fetchUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your info</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="First name"
            value={form.firstName ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          />
          <Input
            label="Last name"
            value={form.lastName ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </form>
      </Card>
    </div>
  );
}
