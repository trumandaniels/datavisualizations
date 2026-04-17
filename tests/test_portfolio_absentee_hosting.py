from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]


class PortfolioAbsenteeHostingTest(unittest.TestCase):
    def test_absentee_dashboard_is_hosted_on_site(self):
        routes_source = (REPO_ROOT / 'portfolio-site' / 'routes.tsx').read_text()
        jukebox_source = (REPO_ROOT / 'portfolio-site' / 'Jukebox.tsx').read_text()
        page_source = (REPO_ROOT / 'portfolio-site' / 'AbsenteeDashboardPage.tsx').read_text()
        screen_source = (REPO_ROOT / 'portfolio-site' / 'AbsenteeDashboardScreen.tsx').read_text()

        self.assertIn("path: '/projects/absentee-dashboard'", routes_source)
        self.assertIn("href: '/projects/absentee-dashboard'", jukebox_source)
        self.assertNotIn('absenteestudentsbystate.onrender.com', jukebox_source)
        self.assertIn('import absenteeCsv from "../AbsenteeStudents/AbsenteeSpreadsheetClean.csv?raw";', screen_source)
        self.assertIn('plotly_doubleclick', screen_source)
        self.assertIn('graphDiv.addEventListener("dblclick", handleExpand);', screen_source)
        self.assertIn('[portfolio_case_study]', page_source)
        self.assertIn('Project Record', page_source)
        self.assertIn('Website Design Language', page_source)


if __name__ == '__main__':
    unittest.main()
