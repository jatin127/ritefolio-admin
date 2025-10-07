"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

interface Currency {
  Id: number;
  Name: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  IsActive: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface CurrencyFormData {
  name: string;
  currencyCode: string;
  currencySymbol: string;
  isActive: boolean;
}

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [formData, setFormData] = useState<CurrencyFormData>({
    name: "",
    currencyCode: "",
    currencySymbol: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      fetchCurrencies();
    };

    checkAuth();
  }, [router, supabase.auth]);

  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/currency");
      const result = await response.json();

      if (result.success) {
        setCurrencies(result.data);
      } else {
        console.error("Failed to fetch currencies:", result.error);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (currency?: Currency) => {
    if (currency) {
      setSelectedCurrency(currency);
      setFormData({
        name: currency.Name,
        currencyCode: currency.CurrencyCode,
        currencySymbol: currency.CurrencySymbol,
        isActive: currency.IsActive,
      });
    } else {
      setSelectedCurrency(null);
      setFormData({
        name: "",
        currencyCode: "",
        currencySymbol: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCurrency(null);
    setFormData({
      name: "",
      currencyCode: "",
      currencySymbol: "",
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const url = selectedCurrency
        ? `/api/currency/${selectedCurrency.Id}`
        : "/api/currency";

      const method = selectedCurrency ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        handleCloseModal();
        fetchCurrencies();
      } else {
        console.error("Failed to save currency:", result.error);
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error saving currency:", error);
      alert("Failed to save currency");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCurrency) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/currency/${selectedCurrency.Id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedCurrency(null);
        fetchCurrencies();
      } else {
        console.error("Failed to delete currency:", result.error);
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      alert("Failed to delete currency");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCurrency(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Currency</h1>
            <p className="mt-2 text-default-500">Manage currency master data</p>
          </div>
          <Button
            color="primary"
            startContent={<FiPlus className="text-lg" />}
            onPress={() => handleOpenModal()}
          >
            Add Currency
          </Button>
        </div>

        {/* Currency Table */}
        <Table
          aria-label="Currency table"
          className="max-h-[70vh] overflow-auto"
          isHeaderSticky
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>CODE</TableColumn>
            <TableColumn>SYMBOL</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {currencies.map((currency) => (
              <TableRow key={currency.Id}>
                <TableCell>{currency.Id}</TableCell>
                <TableCell>{currency.Name}</TableCell>
                <TableCell>{currency.CurrencyCode}</TableCell>
                <TableCell>{currency.CurrencySymbol}</TableCell>
                <TableCell>
                  <Chip
                    color={currency.IsActive ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {currency.IsActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      isIconOnly
                      onPress={() => handleOpenModal(currency)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => openDeleteModal(currency)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedCurrency ? "Edit Currency" : "Add Currency"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Enter currency name"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                  isRequired
                />
                <Input
                  label="Currency Code"
                  placeholder="Enter currency code (e.g., USD, EUR)"
                  value={formData.currencyCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currencyCode: value })
                  }
                  isRequired
                />
                <Input
                  label="Currency Symbol"
                  placeholder="Enter currency symbol (e.g., $, €)"
                  value={formData.currencySymbol}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currencySymbol: value })
                  }
                  isRequired
                />
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value })
                  }
                >
                  Active
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleCloseModal}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              >
                {selectedCurrency ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete the currency{" "}
                <strong>{selectedCurrency?.Name}</strong>?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleDelete}
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
