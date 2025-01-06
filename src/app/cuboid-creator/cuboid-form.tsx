"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { materialList } from "@/lib/quote-price/core";

const materials = materialList.map((material) => material.name);

const colors = [
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#00FF00" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
] as const;

const formSchema = z.object({
  materialName: z.string().min(1, "Material is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  color: z.string().min(1, "Color is required"),
  dimensions: z.object({
    width: z.number().min(1, "Width must be at least 1"),
    depth: z.number().min(1, "Depth must be at least 1"),
    height: z.number().min(1, "Height must be at least 1"),
  }),
  netVolume: z.number().min(0, "Net volume must be non-negative"),
  cavityCount: z.number().min(1, "Cavity count must be at least 1"),
});

export type FormSchema = z.infer<typeof formSchema>;

interface CuboidData {
  id: number;
  materialName: string;
  quantity: number;
  color: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  netVolume: number;
  cavityCount: number;
}

interface CuboidFormProps {
  cuboid: CuboidData;
  onUpdate: (id: number, data: Partial<FormSchema>) => void;
}

export default function CuboidForm({ cuboid, onUpdate }: CuboidFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: cuboid,
  });

  const onSubmit = (data: FormSchema) => {
    onUpdate(cuboid.id, data);
  };

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="materialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>材料</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>生产数量</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>颜色</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem
                      key={color.value}
                      value={color.value}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dimensions.width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>宽度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>深度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>高度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="netVolume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>净体积</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cavityCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>穴数</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
