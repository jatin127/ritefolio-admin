"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { createClient } from "@/lib/supabase/client";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiFileText,
  FiBarChart2,
  FiFolder,
  FiImage,
  FiMail,
  FiShield,
  FiTool,
  FiChevronDown,
  FiDollarSign,
  FiGlobe,
} from "react-icons/fi";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavigationGroup {
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
}

type NavigationConfig = (NavigationItem | NavigationGroup)[];

const navigationConfig: NavigationConfig = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <FiHome className="text-xl" />,
  },
  {
    label: "Portfolio",
    icon: <FiFolder className="text-xl" />,
    items: [
      {
        label: "Projects",
        href: "/dashboard/projects",
        icon: <FiFileText className="text-lg" />,
      },
      {
        label: "Media",
        href: "/dashboard/media",
        icon: <FiImage className="text-lg" />,
      },
      {
        label: "Categories",
        href: "/dashboard/categories",
        icon: <FiFolder className="text-lg" />,
      },
    ],
  },
  {
    label: "Content",
    icon: <FiFileText className="text-xl" />,
    items: [
      {
        label: "Pages",
        href: "/dashboard/pages",
        icon: <FiFileText className="text-lg" />,
      },
      {
        label: "Blog Posts",
        href: "/dashboard/blog",
        icon: <FiFileText className="text-lg" />,
      },
      {
        label: "Testimonials",
        href: "/dashboard/testimonials",
        icon: <FiMail className="text-lg" />,
      },
    ],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <FiBarChart2 className="text-xl" />,
  },
  {
    label: "Currency",
    href: "/currency",
    icon: <FiDollarSign className="text-xl" />,
  },
  {
    label: "Country",
    href: "/country",
    icon: <FiGlobe className="text-xl" />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <FiUsers className="text-xl" />,
  },
  {
    label: "System",
    icon: <FiTool className="text-xl" />,
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <FiSettings className="text-lg" />,
      },
      {
        label: "Security",
        href: "/dashboard/security",
        icon: <FiShield className="text-lg" />,
      },
    ],
  },
];

function isNavigationGroup(
  item: NavigationItem | NavigationGroup
): item is NavigationGroup {
  return "items" in item;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(["0"]));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Don't render sidebar if user is not logged in
  if (!isAuthenticated) {
    return null;
  }

  const renderNavigationItem = (item: NavigationItem) => {
    const active = isActive(item.href);

    return (
      <NextLink
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
          ${
            active
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-default-700 hover:bg-default-100 hover:text-default-900"
          }
        `}
        onClick={onClose}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </NextLink>
    );
  };

  const renderNavigationGroup = (group: NavigationGroup, index: number) => {
    const hasActiveChild = group.items.some((item) => isActive(item.href));

    return (
      <Accordion
        key={index}
        selectedKeys={expandedKeys}
        onSelectionChange={(keys) => setExpandedKeys(keys as Set<string>)}
        className="px-0"
        itemClasses={{
          base: "px-0",
          title: "text-default-700 font-medium",
          trigger:
            "px-4 py-2.5 rounded-lg hover:bg-default-100 data-[hover=true]:bg-default-100",
          content: "px-0 pt-2 pb-1",
        }}
      >
        <AccordionItem
          key={index.toString()}
          aria-label={group.label}
          title={
            <div className="flex items-center gap-3">
              {group.icon}
              <span>{group.label}</span>
            </div>
          }
          indicator={<FiChevronDown className="text-default-500" />}
          classNames={{
            title: hasActiveChild ? "text-primary" : "text-default-700",
          }}
        >
          <div className="flex flex-col gap-1 pl-4">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      active
                        ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary"
                        : "text-default-600 hover:bg-default-50 hover:text-default-900"
                    }
                  `}
                  onClick={onClose}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NextLink>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-[64px] bottom-0 w-64
        bg-background border-r border-t border-default-200
        transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 overflow-hidden
      `}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-default-300 scrollbar-track-transparent">
          {navigationConfig.map((item, index) => {
            if (isNavigationGroup(item)) {
              return renderNavigationGroup(item, index);
            }
            return renderNavigationItem(item);
          })}
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-default-200 bg-background">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-default-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Admin
              </p>
              <p className="text-xs text-default-500 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Mobile Sidebar Overlay
export const MobileSidebarOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
};
