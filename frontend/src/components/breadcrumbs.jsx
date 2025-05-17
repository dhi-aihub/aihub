import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useMatch, useNavigate, matchPath } from "react-router-dom";
import { Typography } from "@mui/material";

const MuiBreadcrumbs = props => {
  const navigate = useNavigate();
  const pathnames = window.location.pathname.split("/").filter(x => x);

  // Unconditionally call all useMatch hooks
  const matchVerifyEmail = useMatch({ path: "/account/verify_email/" });
  const matchSignUp = useMatch({ path: "/signup/" });
  const matchResetPassword = useMatch({ path: "/reset_password/" });
  const matchConfirmResetPassword = useMatch({ path: "/account/reset_password_confirm/" });

  // Helper functions to determine breadcrumb names
  const getBreadcrumbName = pathname => {
    const breadcrumbMap = [
      { pattern: "/course_admin/:id", name: "Admin" },
      { pattern: "/course_admin", name: "Courses" },
      { pattern: "/admin", name: "Admin" },
      { pattern: "/admin/create_course", name: "Create Course" },
      { pattern: "/courses", name: "Courses" },
      { pattern: "/courses/:id/:task_id", name: "Submissions" },
      { pattern: "/courses/:id", name: "Tasks" },
      { pattern: "/signin", name: "Sign In" },
      { pattern: "/api_test", name: "API Tester" },
    ];

    for (const { pattern, name } of breadcrumbMap) {
      const match = matchPath({ path: pattern, end: true }, pathname);
      if (match) return name;
    }

    return "Unknown";
  };

  const matchSpecial = () => {
    if (matchVerifyEmail) return "Verify Email";
    if (matchSignUp) return "Sign Up";
    if (matchResetPassword) return "Reset Password";
    if (matchConfirmResetPassword) return "Confirm Reset Password";
    return null;
  };

  // Generate breadcrumb links
  let links;
  const special = matchSpecial();
  if (special) {
    links = <Typography key={`link_0`}>{special}</Typography>;
  } else {
    links = pathnames.map((_, index) => {
      const to = `/${pathnames.slice(0, index + 1).join("/")}`;
      const last = index === pathnames.length - 1;
      const displayName = getBreadcrumbName(to);
      return last ? (
        <Typography key={`link_${index}`}>{displayName}</Typography>
      ) : (
        <Link key={`link_${index}`} underline="hover" onClick={() => navigate(to)}>
          {displayName}
        </Link>
      );
    });
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ marginTop: 2, marginLeft: 4, marginBottom: 3 }}>
      <Link underline="hover" onClick={() => navigate("/")}>
        Home
      </Link>
      {links}
    </Breadcrumbs>
  );
};

export default MuiBreadcrumbs;
