"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

interface ContactInfoCardProps {
  contactInfo: ContactInfo;
  onChange: (info: Partial<ContactInfo>) => void;
  errors?: Partial<Record<keyof ContactInfo, string>>;
}

export function ContactInfoCard({
  contactInfo,
  onChange,
  errors,
}: ContactInfoCardProps) {
  // 验证中国内地手机号码格式
  const validatePhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneChange = (value: string) => {
    // 只允许输入数字
    const numericValue = value.replace(/\D/g, "");
    onChange({ phone: numericValue });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">联系信息</h3>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              姓名
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              placeholder="请输入姓名"
              value={contactInfo.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className={cn(errors?.name && "border-destructive")}
            />
            <p className="text-sm text-muted-foreground">
              请输入2-20个字符的真实姓名
            </p>
            {errors?.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              联系电话
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号码"
              value={contactInfo.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
              className={cn(errors?.phone && "border-destructive")}
            />
            <p className="text-sm text-muted-foreground">
              请输入11位中国大陆手机号
            </p>
            {errors?.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              电子邮箱
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入电子邮箱"
              value={contactInfo.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className={cn(errors?.email && "border-destructive")}
            />
            <p className="text-sm text-muted-foreground">
              格式：example@domain.com
            </p>
            {errors?.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
