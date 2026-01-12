"use client";

import React from "react";
import {
  mockCategories,
  mockProducts
} from "@/lib/mock-data/mock-data";
import { Heading, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import {
  Layers,
  Package,
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { Section } from "@/components/ui/section";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Products",
      value: mockProducts.length,
      icon: Package,
      color: "bg-blue-500",
      trend: "+12% from last month"
    },
    {
      label: "Total Categories",
      value: mockCategories.length,
      icon: Layers,
      color: "bg-emerald-500",
      trend: "+2 new this week"
    },
    {
      label: "Active Users",
      value: "1,284",
      icon: Users,
      color: "bg-amber-500",
      trend: "+5.4% from yesterday"
    },
    {
      label: "Monthly Revenue",
      value: "$42,850",
      icon: TrendingUp,
      color: "bg-rose-500",
      trend: "+18% vs target"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <Heading level="h2">Dashboard Overview</Heading>
        <Text className="text-warm-gray-500">
          Welcome back to your ShopHub management console.
        </Text>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 border-warm-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={stat.color + " p-3 rounded-lg text-white shadow-lg shadow-current/20"}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                7.2%
              </div>
            </div>
            <div className="mt-4">
              <Text className="text-sm font-medium text-warm-gray-500">{stat.label}</Text>
              <div className="flex items-baseline gap-2">
                <Heading level="h3" className="text-2xl font-bold text-warm-gray-900">
                  {stat.value}
                </Heading>
              </div>
              <Text className="text-[10px] text-warm-gray-400 mt-1 font-medium italic">
                {stat.trend}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-warm-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <Heading level="h4">Recent Activity</Heading>
            </div>
            <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-warm-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-warm-gray-400" />
                </div>
                <div>
                  <Text className="text-sm font-semibold text-warm-gray-900">New product added</Text>
                  <Text className="text-xs text-warm-gray-500">iPhone 15 Pro Max was added to Phones category</Text>
                  <Text className="text-[10px] text-warm-gray-400 mt-1 uppercase font-bold tracking-tight">2 hours ago</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-warm-gray-200 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <Heading level="h4">Category Performance</Heading>
            </div>
            <button className="text-xs font-bold text-primary-600 hover:underline">Full report</button>
          </div>
          <div className="space-y-4">
             {mockCategories.slice(0, 5).map((cat) => (
               <div key={cat.id} className="space-y-1.5">
                 <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-warm-gray-600">
                    <span>{cat.name}</span>
                    <span>{Math.floor(Math.random() * 100)}%</span>
                 </div>
                 <div className="w-full bg-warm-gray-100 h-2 rounded-full overflow-hidden">
                   <div
                     className="bg-primary-500 h-full transition-all duration-1000"
                     style={{ width: `${Math.floor(Math.random() * 60) + 30}%` }}
                   />
                 </div>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
