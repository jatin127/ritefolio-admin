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
import { Select, SelectItem } from "@heroui/select";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

interface Country {
  Id: number;
  Name: string;
  IsoCode: string;
  CurrencyName: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  CountryCode: number;
  IsActive: boolean;
}

interface Currency {
  Id: number;
  Name: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  IsActive: boolean;
}

interface CountryFormData {
  name: string;
  isoCode: string;
  currencyCode: string;
  countryCode: string;
  isActive: boolean;
}

export default function CountryPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CountryFormData>({
    name: "",
    isoCode: "",
    currencyCode: "",
    countryCode: "",
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

      fetchCountries();
      fetchCurrencies();
    };

    checkAuth();
  }, [router, supabase.auth]);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/country");
      const result = await response.json();

      if (result.success) {
        setCountries(result.data);
      } else {
        console.error("Failed to fetch countries:", result.error);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/currency");
      const result = await response.json();

      if (result.success) {
        setCurrencies(result.data.filter((c: Currency) => c.IsActive));
      } else {
        console.error("Failed to fetch currencies:", result.error);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const handleOpenModal = (country?: Country) => {
    if (country) {
      setSelectedCountry(country);
      setFormData({
        name: country.Name,
        isoCode: country.IsoCode,
        currencyCode: country.CurrencyCode,
        countryCode: country.CountryCode.toString(),
        isActive: country.IsActive,
      });
    } else {
      setSelectedCountry(null);
      setFormData({
        name: "",
        isoCode: "",
        currencyCode: "",
        countryCode: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
    setFormData({
      name: "",
      isoCode: "",
      currencyCode: "",
      countryCode: "",
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const url = selectedCountry
        ? `/api/country/${selectedCountry.Id}`
        : "/api/country";

      const method = selectedCountry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          countryCode: parseInt(formData.countryCode),
        }),
      });

      const result = await response.json();

      if (result.success) {
        handleCloseModal();
        fetchCountries();
      } else {
        console.error("Failed to save country:", result.error);
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error saving country:", error);
      alert("Failed to save country");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCountry) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/country/${selectedCountry.Id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedCountry(null);
        fetchCountries();
      } else {
        console.error("Failed to delete country:", result.error);
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error("Error deleting country:", error);
      alert("Failed to delete country");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (country: Country) => {
    setSelectedCountry(country);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCountry(null);
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
            <h1 className="text-4xl font-bold text-foreground">Country</h1>
            <p className="mt-2 text-default-500">Manage country master data</p>
          </div>
          <Button
            color="primary"
            startContent={<FiPlus className="text-lg" />}
            onPress={() => handleOpenModal()}
          >
            Add Country
          </Button>
        </div>

        {/* Country Table */}
        <Table
          aria-label="Country table"
          className="max-h-[70vh] overflow-auto"
          isHeaderSticky
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>ISO CODE</TableColumn>
            <TableColumn>COUNTRY CODE</TableColumn>
            <TableColumn>CURRENCY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.Id}>
                <TableCell>{country.Id}</TableCell>
                <TableCell>{country.Name}</TableCell>
                <TableCell>{country.IsoCode}</TableCell>
                <TableCell>{country.CountryCode}</TableCell>
                <TableCell>
                  {country.CurrencyCode} ({country.CurrencySymbol})
                </TableCell>
                <TableCell>
                  <Chip
                    color={country.IsActive ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {country.IsActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      isIconOnly
                      onPress={() => handleOpenModal(country)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => openDeleteModal(country)}
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
              {selectedCountry ? "Edit Country" : "Add Country"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Enter country name"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                  isRequired
                />
                <Input
                  label="ISO Code"
                  placeholder="Enter ISO code (e.g., IN, US)"
                  value={formData.isoCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isoCode: value.toUpperCase() })
                  }
                  maxLength={2}
                  isRequired
                />
                <Input
                  label="Country Code"
                  placeholder="Enter country code (e.g., 91, 1)"
                  type="number"
                  value={formData.countryCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, countryCode: value })
                  }
                  isRequired
                />
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  selectedKeys={
                    formData.currencyCode ? [formData.currencyCode] : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, currencyCode: selected });
                  }}
                  isRequired
                >
                  {currencies.map((currency) => (
                    <SelectItem
                      key={currency.CurrencyCode}
                      value={currency.CurrencyCode}
                    >
                      {currency.Name} ({currency.CurrencyCode} -{" "}
                      {currency.CurrencySymbol})
                    </SelectItem>
                  ))}
                </Select>
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
                {selectedCountry ? "Update" : "Create"}
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
                Are you sure you want to delete the country{" "}
                <strong>{selectedCountry?.Name}</strong>?
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
