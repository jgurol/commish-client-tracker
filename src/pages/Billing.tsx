
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

export default function Billing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock billing data - replace with actual billing data fetching
  const billingData = {
    currentPlan: "Professional",
    planPrice: "$29.99",
    billingCycle: "Monthly",
    nextBillingDate: "2025-06-24",
    paymentMethod: "**** **** **** 4242",
    invoices: [
      {
        id: "INV-001",
        date: "2025-05-24",
        amount: "$29.99",
        status: "Paid",
        downloadUrl: "#"
      },
      {
        id: "INV-002", 
        date: "2025-04-24",
        amount: "$29.99",
        status: "Paid",
        downloadUrl: "#"
      },
      {
        id: "INV-003",
        date: "2025-03-24", 
        amount: "$29.99",
        status: "Paid",
        downloadUrl: "#"
      }
    ]
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Please log in to access billing information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscriptions</h1>
        <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your active subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{billingData.currentPlan}</h3>
                <p className="text-gray-600">{billingData.planPrice} / {billingData.billingCycle.toLowerCase()}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-sm text-gray-600">{billingData.nextBillingDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600">{billingData.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Update Payment Method</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              Download your invoices and view payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingData.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-gray-600">{invoice.date}</p>
                    </div>
                    <div>
                      <p className="font-medium">{invoice.amount}</p>
                      <Badge 
                        variant={invoice.status === "Paid" ? "secondary" : "destructive"}
                        className={invoice.status === "Paid" ? "bg-green-100 text-green-800" : ""}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              Current usage against your plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Transactions</span>
                  <span>125 / 1000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>2.1 GB / 10 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
