import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import AssessmentListPage from './AssessmentReportPage';
import AssessmentReviewPage from './AssessmentReviewPage';

const RoleBasedAssessmentPage: React.FC = () => {
  const { currentUser } = useRole();

  // Institution admins see the data table (AssessmentListPage)
  // County and National admins see the review page (AssessmentReviewPage)
  if (currentUser.role === 'school_admin') {
    return <AssessmentListPage />;
  } 

  // Agent admins and Institution admins (admin role) see the review page
  if (currentUser.role === 'agent' || currentUser.role === 'ministry_admin') {
    return <AssessmentReviewPage />;
  }

  // Fallback - shouldn't happen with proper role setup
  return <AssessmentListPage />;
};

export default RoleBasedAssessmentPage;