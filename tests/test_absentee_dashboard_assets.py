from pathlib import Path
import unittest


REPO_ROOT = Path(__file__).resolve().parents[1]


class AbsenteeDashboardAssetsTest(unittest.TestCase):
    def test_fullscreen_hooks_exist(self):
        app_source = (REPO_ROOT / "AbsenteeStudents" / "app.py").read_text()
        fullscreen_script = (
            REPO_ROOT / "AbsenteeStudents" / "assets" / "fullscreen.js"
        ).read_text()

        self.assertIn("id='us-map-shell'", app_source)
        self.assertIn("id='minimize-map'", app_source)
        self.assertIn("app.run(debug=True)", app_source)
        self.assertIn("plotly_doubleclick", fullscreen_script)
        self.assertIn("is-fullscreen", fullscreen_script)


if __name__ == "__main__":
    unittest.main()
