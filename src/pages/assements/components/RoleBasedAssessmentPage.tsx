import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import AssessmentListPage from './AssessmentlistPage';
import AssessmentReviewPage from './AssesmentReviewPage';

const RoleBasedAssessmentPage: React.FC = () => {
  const { currentUser } = useRole();

  // School admins see the data table (AssessmentListPage)
  // County and National admins see the review page (AssessmentReviewPage)
  if (currentUser.role === 'school_admin') {
    return <AssessmentListPage />;
  } 
  
  // County admins and National admins (admin role) see the review page
  if (currentUser.role === 'county_admin' || currentUser.role === 'admin') {
    return <AssessmentReviewPage />;
  }

  // Fallback - shouldn't happen with proper role setup
  return <AssessmentListPage />;
};

export default RoleBasedAssessmentPage;