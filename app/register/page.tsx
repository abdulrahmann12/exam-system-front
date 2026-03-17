"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentService } from "@/services/studentService";
import { registerSchema, type RegisterFormValues } from "@/schemas";
import { mapServerError } from "@/lib/formErrors";
import { useAcademicCascade } from "@/hooks/useAcademicCascade";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormField, selectClass } from "@/components/ui/FormField";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { colleges, departments, loadingColleges, loadingDepartments, loadDepartments } =
    useAcademicCascade();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      collegeId: 0,
      departmentId: 0,
      studentCode: "",
      academicYear: 1,
    },
  });

  const collegeId = watch("collegeId");

  const onCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setValue("collegeId", id, { shouldValidate: true });
    setValue("departmentId", 0);
    loadDepartments(id);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await studentService.register(data);
      toast.success("Registration successful. Please sign in.");
      router.push("/login");
    } catch (err) {
      if (!mapServerError(err, setError)) {
        toast.error(err instanceof Error ? err.message : "Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
          <p className="text-sm text-zinc-500 text-center mt-1">
            Create your account to take exams
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <Input
            label="Username"
            error={errors.username?.message}
            {...register("username")}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <FormField label="College" error={errors.collegeId?.message}>
            <select
              className={selectClass}
              value={collegeId || ""}
              onChange={onCollegeChange}
              disabled={loadingColleges}
            >
              <option value="">Select college</option>
              {colleges.map((c) => (
                <option key={c.collegeId} value={c.collegeId}>
                  {c.collegeName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Department" error={errors.departmentId?.message}>
            <select
              className={selectClass}
              disabled={!collegeId || loadingDepartments}
              {...register("departmentId", { valueAsNumber: true })}
            >
              <option value="0">Select department</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </FormField>

          <Input
            label="Student code"
            placeholder="e.g. 2025001234"
            error={errors.studentCode?.message}
            {...register("studentCode")}
          />

          <FormField label="Academic year" error={errors.academicYear?.message}>
            <select
              className={selectClass}
              {...register("academicYear", { valueAsNumber: true })}
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </FormField>

          <Button type="submit" fullWidth loading={isSubmitting} size="lg">
            Register
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
