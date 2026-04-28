import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import {
  FaUser,
  FaBell,
  FaShieldAlt,
  FaLanguage,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../https";
import { removeUser } from "../redux/slices/userSlice";
import { enqueueSnackbar } from "notistack";

const More = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    document.title = "DineFlow | More";
  }, []);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      enqueueSnackbar("Logged out successfully", { variant: "success" });
      navigate("/auth");
    },
    onError: () => {
      enqueueSnackbar("Logout failed", { variant: "error" });
    },
  });

  const initials = (userData.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const groups = [
    {
      label: "Account",
      items: [
        { Icon: FaUser,           label: "Profile",            sub: "Name, photo, details",    route: "/profile" },
        { Icon: FaBell,           label: "Notifications",      sub: "Alerts & sounds",         route: "/notifications" },
      ],
    },
    {
      label: "Settings",
      items: [
        { Icon: FaShieldAlt,      label: "Privacy & Security", sub: "Password & sessions",     route: "/privacy" },
        { Icon: FaLanguage,       label: "Language",            sub: "Display language",        route: "/language" },
      ],
    },
    {
      label: "Help",
      items: [
        { Icon: FaQuestionCircle, label: "Help & Support",     sub: "FAQs, contact us",        route: "/support" },
      ],
    },
  ];

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3
                      bg-[#0f0f0f] border-b border-[#1f1f1f]">
        <BackButton />
        <span className="text-yellow-400 font-bold text-lg">More</span>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

          {/* ── Profile card ── */}
          <div className="rounded-2xl bg-[#181818] border border-[#2a2a2a] p-4 flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
                <span className="text-black font-extrabold text-sm">{initials}</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                               bg-green-500 border-2 border-[#181818]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {userData.name || "User"}
              </p>
              <p className="text-gray-500 text-xs truncate mt-0.5">
                {userData.email || "user@example.com"}
              </p>
            </div>

            {/* Role badge */}
            <span className="flex-shrink-0 text-[11px] font-semibold text-yellow-400
                             bg-yellow-400/10 border border-yellow-400/20
                             px-2.5 py-1 rounded-lg">
              {userData.role || "Staff"}
            </span>
          </div>

          {/* ── Groups ── */}
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">
                {group.label}
              </p>

              {/* Grouped rows inside one card */}
              <div className="rounded-2xl bg-[#181818] border border-[#2a2a2a] overflow-hidden">
                {group.items.map((item, i) => {
                  const { Icon } = item;
                  return (
                    <React.Fragment key={item.label}>
                      {i > 0 && <div className="mx-4 h-px bg-[#222]" />}
                      <button
                        onClick={() => navigate(item.route)}
                        className="w-full flex items-center gap-3 px-4 py-3
                                   hover:bg-[#1e1e1e] transition-colors duration-150 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#252525] flex items-center
                                        justify-center flex-shrink-0">
                          <Icon size={12} className="text-yellow-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-gray-200 text-sm font-medium">{item.label}</p>
                          <p className="text-gray-600 text-xs">{item.sub}</p>
                        </div>
                        <FaChevronRight
                          size={10}
                          className="text-gray-700 group-hover:text-gray-500 transition-colors"
                        />
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── Logout ── */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">
              Session
            </p>
            <div className="rounded-2xl bg-[#181818] border border-[#2a2a2a] overflow-hidden">
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-red-500/5 transition-colors duration-150 group
                           disabled:opacity-50"
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center
                                justify-center flex-shrink-0">
                  <FaSignOutAlt size={12} className="text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-red-400 text-sm font-medium">
                    {logoutMutation.isPending ? "Logging out…" : "Log out"}
                  </p>
                  <p className="text-gray-600 text-xs">End your session</p>
                </div>
                <FaChevronRight
                  size={10}
                  className="text-gray-700 group-hover:text-red-500 transition-colors"
                />
              </button>
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-gray-700 text-[11px] pb-1">
            DineFlow · v1.0.0
          </p>

        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default More;