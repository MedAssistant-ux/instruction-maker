# Instruction Maker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python desktop app that captures screenshots, annotates them, adds formatted directions, and exports as PDF/Word instruction documents.

**Architecture:** PyQt6 single-window app with sidebar navigator, annotation canvas (QGraphicsScene), rich text editor, and export engines. Projects stored as JSON + images on disk.

**Tech Stack:** Python 3.11+, PyQt6, pywin32, reportlab, python-docx, Pillow

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `requirements.txt`
- Create: `main.py`
- Create: `ui/__init__.py`
- Create: `core/__init__.py`
- Create: `assets/themes/dark.qss`
- Create: `assets/themes/light.qss`

- [ ] **Step 1: Create requirements.txt**

```
PyQt6>=6.6
pywin32>=306
reportlab>=4.1
python-docx>=1.1
Pillow>=10.0
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p ui core assets/icons assets/themes tests
```

- [ ] **Step 3: Create `ui/__init__.py` and `core/__init__.py`**

Both are empty files to make them Python packages:

```python
# ui/__init__.py
```

```python
# core/__init__.py
```

- [ ] **Step 4: Create dark theme stylesheet `assets/themes/dark.qss`**

```css
QMainWindow, QWidget {
    background-color: #1a1a2e;
    color: #e0e0e0;
}

QTreeWidget {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 4px;
    outline: none;
}

QTreeWidget::item {
    padding: 4px 8px;
    border-radius: 4px;
}

QTreeWidget::item:selected {
    background-color: #0f3460;
    color: #4fc3f7;
}

QTreeWidget::item:hover {
    background-color: #1a2744;
}

QToolBar {
    background-color: #16213e;
    border: none;
    spacing: 4px;
    padding: 4px;
}

QToolButton {
    background-color: #333;
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 6px;
    min-width: 28px;
    min-height: 28px;
}

QToolButton:checked {
    background-color: #e94560;
    color: white;
    border-color: #e94560;
}

QToolButton:hover {
    background-color: #444;
}

QPushButton {
    background-color: #0f3460;
    color: #e0e0e0;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 6px 16px;
}

QPushButton:hover {
    background-color: #1a4a80;
}

QPushButton#captureButton {
    background-color: #e94560;
    color: white;
    font-weight: bold;
    border: none;
}

QPushButton#captureButton:hover {
    background-color: #ff5a75;
}

QTextEdit {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 8px;
    selection-background-color: #0f3460;
}

QGraphicsView {
    background-color: #222;
    border: 1px solid #333;
    border-radius: 4px;
}

QMenuBar {
    background-color: #16213e;
    color: #e0e0e0;
    border-bottom: 1px solid #333;
}

QMenuBar::item:selected {
    background-color: #0f3460;
}

QMenu {
    background-color: #1a1a2e;
    color: #e0e0e0;
    border: 1px solid #333;
}

QMenu::item:selected {
    background-color: #0f3460;
}

QSplitter::handle {
    background-color: #333;
    width: 2px;
    height: 2px;
}

QLabel {
    color: #e0e0e0;
}

QComboBox {
    background-color: #16213e;
    color: #e0e0e0;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 4px 8px;
}

QComboBox::drop-down {
    border: none;
}

QComboBox QAbstractItemView {
    background-color: #1a1a2e;
    color: #e0e0e0;
    selection-background-color: #0f3460;
}

QSlider::groove:horizontal {
    background-color: #333;
    height: 6px;
    border-radius: 3px;
}

QSlider::handle:horizontal {
    background-color: #4fc3f7;
    width: 14px;
    height: 14px;
    margin: -4px 0;
    border-radius: 7px;
}

QDialog {
    background-color: #1a1a2e;
    color: #e0e0e0;
}

QGroupBox {
    color: #4fc3f7;
    border: 1px solid #333;
    border-radius: 4px;
    margin-top: 12px;
    padding-top: 16px;
}

QGroupBox::title {
    subcontrol-origin: margin;
    left: 10px;
}

QScrollBar:vertical {
    background-color: #1a1a2e;
    width: 10px;
    border: none;
}

QScrollBar::handle:vertical {
    background-color: #333;
    border-radius: 5px;
    min-height: 30px;
}

QScrollBar::handle:vertical:hover {
    background-color: #444;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0;
}
```

- [ ] **Step 5: Create light theme stylesheet `assets/themes/light.qss`**

```css
QMainWindow, QWidget {
    background-color: #f5f5f5;
    color: #333;
}

QTreeWidget {
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px;
    outline: none;
}

QTreeWidget::item {
    padding: 4px 8px;
    border-radius: 4px;
}

QTreeWidget::item:selected {
    background-color: #e3f2fd;
    color: #1565c0;
}

QTreeWidget::item:hover {
    background-color: #f0f0f0;
}

QToolBar {
    background-color: #fff;
    border: none;
    border-bottom: 1px solid #ddd;
    spacing: 4px;
    padding: 4px;
}

QToolButton {
    background-color: #eee;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px;
    min-width: 28px;
    min-height: 28px;
}

QToolButton:checked {
    background-color: #1565c0;
    color: white;
    border-color: #1565c0;
}

QToolButton:hover {
    background-color: #ddd;
}

QPushButton {
    background-color: #1565c0;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 16px;
}

QPushButton:hover {
    background-color: #1976d2;
}

QPushButton#captureButton {
    background-color: #d32f2f;
    color: white;
    font-weight: bold;
}

QPushButton#captureButton:hover {
    background-color: #e53935;
}

QTextEdit {
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    selection-background-color: #e3f2fd;
}

QGraphicsView {
    background-color: #e8e8e8;
    border: 1px solid #ddd;
    border-radius: 4px;
}

QMenuBar {
    background-color: #fff;
    color: #333;
    border-bottom: 1px solid #ddd;
}

QMenuBar::item:selected {
    background-color: #e3f2fd;
}

QMenu {
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
}

QMenu::item:selected {
    background-color: #e3f2fd;
}

QSplitter::handle {
    background-color: #ddd;
    width: 2px;
    height: 2px;
}

QLabel {
    color: #333;
}

QComboBox {
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
}

QComboBox QAbstractItemView {
    background-color: #fff;
    color: #333;
    selection-background-color: #e3f2fd;
}

QSlider::groove:horizontal {
    background-color: #ddd;
    height: 6px;
    border-radius: 3px;
}

QSlider::handle:horizontal {
    background-color: #1565c0;
    width: 14px;
    height: 14px;
    margin: -4px 0;
    border-radius: 7px;
}

QDialog {
    background-color: #f5f5f5;
    color: #333;
}

QGroupBox {
    color: #1565c0;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 12px;
    padding-top: 16px;
}

QGroupBox::title {
    subcontrol-origin: margin;
    left: 10px;
}

QScrollBar:vertical {
    background-color: #f5f5f5;
    width: 10px;
    border: none;
}

QScrollBar::handle:vertical {
    background-color: #ccc;
    border-radius: 5px;
    min-height: 30px;
}

QScrollBar::handle:vertical:hover {
    background-color: #aaa;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0;
}
```

- [ ] **Step 6: Create minimal `main.py` entry point**

```python
import sys
import os
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Instruction Maker")
    app.setOrganizationName("InstructionMaker")

    # Load dark theme by default
    theme_path = os.path.join(os.path.dirname(__file__), "assets", "themes", "dark.qss")
    if os.path.exists(theme_path):
        with open(theme_path, "r") as f:
            app.setStyleSheet(f.read())

    # Placeholder - will be replaced with MainWindow in Task 7
    from PyQt6.QtWidgets import QLabel
    window = QLabel("Instruction Maker - Loading...")
    window.setFixedSize(800, 600)
    window.setAlignment(Qt.AlignmentFlag.AlignCenter)
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
```

- [ ] **Step 7: Install dependencies and verify app launches**

```bash
pip install -r requirements.txt
python main.py
```

Expected: A dark-themed window appears with placeholder text. Close it to exit cleanly.

- [ ] **Step 8: Commit**

```bash
git init
git add requirements.txt main.py ui/__init__.py core/__init__.py assets/themes/dark.qss assets/themes/light.qss
git commit -m "feat: scaffold project with dependencies and theme"
```

---

### Task 2: Project Data Model

**Files:**
- Create: `core/project.py`
- Create: `tests/test_project.py`

- [ ] **Step 1: Write failing tests for project data model**

Create `tests/__init__.py` (empty) and `tests/test_project.py`:

```python
import os
import json
import shutil
import tempfile
import pytest
from core.project import Project, Section, Step


class TestStep:
    def test_create_step(self):
        step = Step(title="Click Save")
        assert step.title == "Click Save"
        assert step.screenshots == []
        assert step.annotations == []
        assert step.direction_html == ""
        assert step.step_id is not None

    def test_step_to_dict(self):
        step = Step(title="Click Save")
        d = step.to_dict()
        assert d["title"] == "Click Save"
        assert d["screenshots"] == []
        assert d["direction_html"] == ""

    def test_step_from_dict(self):
        data = {
            "step_id": "abc123",
            "title": "Click Save",
            "screenshots": ["img001.png"],
            "annotations": [],
            "direction_html": "<b>Click</b> save",
        }
        step = Step.from_dict(data)
        assert step.step_id == "abc123"
        assert step.title == "Click Save"
        assert step.screenshots == ["img001.png"]
        assert step.direction_html == "<b>Click</b> save"


class TestSection:
    def test_create_section(self):
        section = Section(title="Getting Started")
        assert section.title == "Getting Started"
        assert section.steps == []

    def test_add_step(self):
        section = Section(title="Setup")
        step = Step(title="Open app")
        section.add_step(step)
        assert len(section.steps) == 1
        assert section.steps[0].title == "Open app"

    def test_section_to_dict(self):
        section = Section(title="Setup")
        section.add_step(Step(title="Step 1"))
        d = section.to_dict()
        assert d["title"] == "Setup"
        assert len(d["steps"]) == 1

    def test_section_from_dict(self):
        data = {
            "section_id": "sec1",
            "title": "Setup",
            "steps": [
                {
                    "step_id": "s1",
                    "title": "Open",
                    "screenshots": [],
                    "annotations": [],
                    "direction_html": "",
                }
            ],
        }
        section = Section.from_dict(data)
        assert section.title == "Setup"
        assert len(section.steps) == 1


class TestProject:
    def setup_method(self):
        self.temp_dir = tempfile.mkdtemp()

    def teardown_method(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_create_new_project(self):
        project = Project.create_new("Test Guide", self.temp_dir)
        assert project.name == "Test Guide"
        assert os.path.isdir(os.path.join(self.temp_dir, "images"))
        assert os.path.isdir(os.path.join(self.temp_dir, "annotations"))
        assert len(project.sections) == 1
        assert project.sections[0].title == "Section 1"
        assert len(project.sections[0].steps) == 1

    def test_save_and_load_project(self):
        project = Project.create_new("Test Guide", self.temp_dir)
        project.sections[0].steps[0].direction_html = "<p>Hello</p>"
        project.save()

        loaded = Project.load(self.temp_dir)
        assert loaded.name == "Test Guide"
        assert loaded.sections[0].steps[0].direction_html == "<p>Hello</p>"

    def test_add_section(self):
        project = Project.create_new("Test", self.temp_dir)
        project.add_section("New Section")
        assert len(project.sections) == 2
        assert project.sections[1].title == "New Section"

    def test_remove_section(self):
        project = Project.create_new("Test", self.temp_dir)
        project.add_section("Section 2")
        section_id = project.sections[1].section_id
        project.remove_section(section_id)
        assert len(project.sections) == 1

    def test_duplicate_step(self):
        project = Project.create_new("Test", self.temp_dir)
        step = project.sections[0].steps[0]
        step.direction_html = "<p>Original</p>"
        section = project.sections[0]
        new_step = project.duplicate_step(section.section_id, step.step_id)
        assert len(section.steps) == 2
        assert new_step.direction_html == "<p>Original</p>"
        assert new_step.step_id != step.step_id

    def test_move_step(self):
        project = Project.create_new("Test", self.temp_dir)
        project.add_section("Section 2")
        step_id = project.sections[0].steps[0].step_id
        from_section = project.sections[0].section_id
        to_section = project.sections[1].section_id
        project.move_step(step_id, from_section, to_section, 0)
        assert len(project.sections[0].steps) == 0
        assert len(project.sections[1].steps) == 1

    def test_project_json_path(self):
        project = Project.create_new("Test", self.temp_dir)
        project.save()
        assert os.path.isfile(os.path.join(self.temp_dir, "project.json"))
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "C:/Users/hukhu/Desktop/Instruction Program"
python -m pytest tests/test_project.py -v
```

Expected: All tests FAIL with `ModuleNotFoundError: No module named 'core.project'`

- [ ] **Step 3: Implement the project data model**

Create `core/project.py`:

```python
import os
import json
import uuid
import copy
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Step:
    title: str
    step_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    screenshots: list[str] = field(default_factory=list)
    annotations: list[dict] = field(default_factory=list)
    direction_html: str = ""

    def to_dict(self) -> dict:
        return {
            "step_id": self.step_id,
            "title": self.title,
            "screenshots": self.screenshots,
            "annotations": self.annotations,
            "direction_html": self.direction_html,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Step":
        return cls(
            step_id=data["step_id"],
            title=data["title"],
            screenshots=data.get("screenshots", []),
            annotations=data.get("annotations", []),
            direction_html=data.get("direction_html", ""),
        )


@dataclass
class Section:
    title: str
    section_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    steps: list[Step] = field(default_factory=list)

    def add_step(self, step: Step, index: Optional[int] = None):
        if index is not None:
            self.steps.insert(index, step)
        else:
            self.steps.append(step)

    def remove_step(self, step_id: str) -> Optional[Step]:
        for i, step in enumerate(self.steps):
            if step.step_id == step_id:
                return self.steps.pop(i)
        return None

    def to_dict(self) -> dict:
        return {
            "section_id": self.section_id,
            "title": self.title,
            "steps": [s.to_dict() for s in self.steps],
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Section":
        section = cls(
            section_id=data["section_id"],
            title=data["title"],
        )
        section.steps = [Step.from_dict(s) for s in data.get("steps", [])]
        return section


class Project:
    def __init__(self, name: str, path: str, sections: list[Section] = None):
        self.name = name
        self.path = path
        self.sections = sections or []
        self.settings = {
            "page_size": "Letter",
            "header_text": "",
            "logo_path": "",
            "countdown_seconds": 3,
            "theme": "dark",
        }

    @classmethod
    def create_new(cls, name: str, path: str) -> "Project":
        os.makedirs(os.path.join(path, "images"), exist_ok=True)
        os.makedirs(os.path.join(path, "annotations"), exist_ok=True)

        project = cls(name, path)
        first_section = Section(title="Section 1")
        first_section.add_step(Step(title="Step 1"))
        project.sections.append(first_section)
        project.save()
        return project

    @classmethod
    def load(cls, path: str) -> "Project":
        json_path = os.path.join(path, "project.json")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        project = cls(
            name=data["name"],
            path=path,
            sections=[Section.from_dict(s) for s in data.get("sections", [])],
        )
        project.settings = data.get("settings", project.settings)
        return project

    def save(self):
        data = {
            "name": self.name,
            "settings": self.settings,
            "sections": [s.to_dict() for s in self.sections],
        }
        json_path = os.path.join(self.path, "project.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def add_section(self, title: str, index: Optional[int] = None) -> Section:
        section = Section(title=title)
        section.add_step(Step(title="Step 1"))
        if index is not None:
            self.sections.insert(index, section)
        else:
            self.sections.append(section)
        return section

    def remove_section(self, section_id: str):
        self.sections = [s for s in self.sections if s.section_id != section_id]

    def get_section(self, section_id: str) -> Optional[Section]:
        for s in self.sections:
            if s.section_id == section_id:
                return s
        return None

    def duplicate_step(self, section_id: str, step_id: str) -> Optional[Step]:
        section = self.get_section(section_id)
        if not section:
            return None
        for i, step in enumerate(section.steps):
            if step.step_id == step_id:
                new_step = Step(
                    title=step.title + " (copy)",
                    screenshots=list(step.screenshots),
                    annotations=copy.deepcopy(step.annotations),
                    direction_html=step.direction_html,
                )
                section.steps.insert(i + 1, new_step)
                return new_step
        return None

    def move_step(self, step_id: str, from_section_id: str, to_section_id: str, to_index: int):
        from_section = self.get_section(from_section_id)
        to_section = self.get_section(to_section_id)
        if not from_section or not to_section:
            return
        step = from_section.remove_step(step_id)
        if step:
            to_section.add_step(step, to_index)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_project.py -v
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/project.py tests/__init__.py tests/test_project.py
git commit -m "feat: add project data model with sections and steps"
```

---

### Task 3: Screenshot Capture Module

**Files:**
- Create: `core/screenshot.py`
- Create: `tests/test_screenshot.py`

- [ ] **Step 1: Write failing tests for screenshot capture**

```python
import os
import tempfile
import pytest
from unittest.mock import patch, MagicMock
from core.screenshot import capture_active_window, save_screenshot


class TestScreenshotCapture:
    def test_capture_returns_qpixmap(self):
        """Integration test - captures whatever window is active."""
        from PyQt6.QtGui import QPixmap
        pixmap = capture_active_window()
        assert isinstance(pixmap, QPixmap)
        assert not pixmap.isNull()
        assert pixmap.width() > 0
        assert pixmap.height() > 0

    def test_save_screenshot_to_path(self):
        from PyQt6.QtGui import QPixmap
        pixmap = capture_active_window()
        with tempfile.TemporaryDirectory() as tmp:
            filepath = save_screenshot(pixmap, tmp, "test_capture")
            assert os.path.isfile(filepath)
            assert filepath.endswith(".png")
            assert os.path.getsize(filepath) > 0

    def test_save_screenshot_unique_names(self):
        from PyQt6.QtGui import QPixmap
        pixmap = capture_active_window()
        with tempfile.TemporaryDirectory() as tmp:
            path1 = save_screenshot(pixmap, tmp, "shot")
            path2 = save_screenshot(pixmap, tmp, "shot")
            assert path1 != path2
            assert os.path.isfile(path1)
            assert os.path.isfile(path2)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_screenshot.py -v
```

Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement screenshot capture**

Create `core/screenshot.py`:

```python
import os
import time
import ctypes
import ctypes.wintypes
from PyQt6.QtGui import QPixmap, QImage
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QRect

# Win32 constants
SRCCOPY = 0x00CC0020
DIB_RGB_COLORS = 0

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32


class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ("biSize", ctypes.wintypes.DWORD),
        ("biWidth", ctypes.wintypes.LONG),
        ("biHeight", ctypes.wintypes.LONG),
        ("biPlanes", ctypes.wintypes.WORD),
        ("biBitCount", ctypes.wintypes.WORD),
        ("biCompression", ctypes.wintypes.DWORD),
        ("biSizeImage", ctypes.wintypes.DWORD),
        ("biXPelsPerMeter", ctypes.wintypes.LONG),
        ("biYPelsPerMeter", ctypes.wintypes.LONG),
        ("biClrUsed", ctypes.wintypes.DWORD),
        ("biClrImportant", ctypes.wintypes.DWORD),
    ]


class BITMAPINFO(ctypes.Structure):
    _fields_ = [
        ("bmiHeader", BITMAPINFOHEADER),
    ]


def capture_active_window() -> QPixmap:
    """Capture the currently active (foreground) window and return as QPixmap."""
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        # Fallback: capture entire screen
        hwnd = user32.GetDesktopWindow()

    # Get window rect
    rect = ctypes.wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    width = rect.right - rect.left
    height = rect.bottom - rect.top

    if width <= 0 or height <= 0:
        # Fallback to screen capture
        hwnd = user32.GetDesktopWindow()
        user32.GetWindowRect(hwnd, ctypes.byref(rect))
        width = rect.right - rect.left
        height = rect.bottom - rect.top

    # Get device contexts
    hwnd_dc = user32.GetWindowDC(hwnd)
    mem_dc = gdi32.CreateCompatibleDC(hwnd_dc)
    bitmap = gdi32.CreateCompatibleBitmap(hwnd_dc, width, height)
    old_bitmap = gdi32.SelectObject(mem_dc, bitmap)

    # Use PrintWindow for better capture (works with layered windows)
    PW_RENDERFULLCONTENT = 0x00000002
    result = user32.PrintWindow(hwnd, mem_dc, PW_RENDERFULLCONTENT)

    if not result:
        # Fallback to BitBlt
        gdi32.BitBlt(mem_dc, 0, 0, width, height, hwnd_dc, 0, 0, SRCCOPY)

    # Read bitmap data
    bmi = BITMAPINFO()
    bmi.bmiHeader.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bmi.bmiHeader.biWidth = width
    bmi.bmiHeader.biHeight = -height  # Top-down
    bmi.bmiHeader.biPlanes = 1
    bmi.bmiHeader.biBitCount = 32
    bmi.bmiHeader.biCompression = 0

    buf_size = width * height * 4
    buf = ctypes.create_string_buffer(buf_size)
    gdi32.GetDIBits(mem_dc, bitmap, 0, height, buf, ctypes.byref(bmi), DIB_RGB_COLORS)

    # Convert to QImage (BGRA -> ARGB32)
    qimage = QImage(buf, width, height, width * 4, QImage.Format.Format_ARGB32)
    # Make a deep copy since buf will be garbage collected
    qimage = qimage.copy()

    # Cleanup
    gdi32.SelectObject(mem_dc, old_bitmap)
    gdi32.DeleteObject(bitmap)
    gdi32.DeleteDC(mem_dc)
    user32.ReleaseDC(hwnd, hwnd_dc)

    return QPixmap.fromImage(qimage)


def save_screenshot(pixmap: QPixmap, directory: str, name_prefix: str) -> str:
    """Save a QPixmap to the given directory with a unique filename. Returns the full path."""
    os.makedirs(directory, exist_ok=True)
    timestamp = int(time.time() * 1000)
    filename = f"{name_prefix}_{timestamp}.png"
    filepath = os.path.join(directory, filename)
    pixmap.save(filepath, "PNG")
    return filepath
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_screenshot.py -v
```

Expected: All tests PASS. (Tests will capture whatever window is active — likely the terminal.)

- [ ] **Step 5: Commit**

```bash
git add core/screenshot.py tests/test_screenshot.py
git commit -m "feat: add screenshot capture using Win32 API"
```

---

### Task 4: Annotation Data Models

**Files:**
- Create: `core/annotations.py`
- Create: `tests/test_annotations.py`

- [ ] **Step 1: Write failing tests for annotation models**

```python
import json
import pytest
from core.annotations import (
    AnnotationType,
    AnnotationData,
    CircleAnnotation,
    RectAnnotation,
    ArrowAnnotation,
    NumberMarkerAnnotation,
    HighlightAnnotation,
    TextLabelAnnotation,
    BlurAnnotation,
    serialize_annotations,
    deserialize_annotations,
)


class TestAnnotationModels:
    def test_circle_annotation(self):
        ann = CircleAnnotation(x=10, y=20, width=100, height=80, color="#ff0000", thickness=3)
        assert ann.ann_type == AnnotationType.CIRCLE
        d = ann.to_dict()
        assert d["type"] == "circle"
        assert d["x"] == 10
        restored = CircleAnnotation.from_dict(d)
        assert restored.x == 10
        assert restored.color == "#ff0000"

    def test_rect_annotation(self):
        ann = RectAnnotation(x=0, y=0, width=50, height=50, color="#00ff00", thickness=2)
        d = ann.to_dict()
        assert d["type"] == "rect"
        restored = RectAnnotation.from_dict(d)
        assert restored.width == 50

    def test_arrow_annotation(self):
        ann = ArrowAnnotation(x1=10, y1=20, x2=100, y2=200, color="#0000ff", thickness=2)
        d = ann.to_dict()
        assert d["x1"] == 10
        assert d["x2"] == 100
        restored = ArrowAnnotation.from_dict(d)
        assert restored.x2 == 100

    def test_number_marker(self):
        ann = NumberMarkerAnnotation(x=50, y=50, number=3, color="#ff0000")
        d = ann.to_dict()
        assert d["number"] == 3
        restored = NumberMarkerAnnotation.from_dict(d)
        assert restored.number == 3

    def test_highlight_annotation(self):
        ann = HighlightAnnotation(points=[(0, 0), (10, 10), (20, 5)], color="#ffff00", thickness=20)
        d = ann.to_dict()
        assert len(d["points"]) == 3
        restored = HighlightAnnotation.from_dict(d)
        assert len(restored.points) == 3

    def test_text_label(self):
        ann = TextLabelAnnotation(x=10, y=10, text="Click here", color="#ffffff", font_size=14)
        d = ann.to_dict()
        assert d["text"] == "Click here"
        restored = TextLabelAnnotation.from_dict(d)
        assert restored.text == "Click here"

    def test_blur_annotation(self):
        ann = BlurAnnotation(x=10, y=10, width=100, height=50)
        d = ann.to_dict()
        assert d["type"] == "blur"
        restored = BlurAnnotation.from_dict(d)
        assert restored.width == 100

    def test_serialize_deserialize_list(self):
        annotations = [
            CircleAnnotation(x=10, y=20, width=100, height=80, color="#ff0000", thickness=3),
            ArrowAnnotation(x1=0, y1=0, x2=50, y2=50, color="#00ff00", thickness=2),
            NumberMarkerAnnotation(x=25, y=25, number=1, color="#0000ff"),
        ]
        json_str = serialize_annotations(annotations)
        restored = deserialize_annotations(json_str)
        assert len(restored) == 3
        assert isinstance(restored[0], CircleAnnotation)
        assert isinstance(restored[1], ArrowAnnotation)
        assert isinstance(restored[2], NumberMarkerAnnotation)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_annotations.py -v
```

Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement annotation data models**

Create `core/annotations.py`:

```python
import json
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class AnnotationType(Enum):
    CIRCLE = "circle"
    RECT = "rect"
    ARROW = "arrow"
    NUMBER_MARKER = "number_marker"
    HIGHLIGHT = "highlight"
    TEXT_LABEL = "text_label"
    BLUR = "blur"


@dataclass
class AnnotationData:
    ann_type: AnnotationType

    def to_dict(self) -> dict:
        raise NotImplementedError

    @classmethod
    def from_dict(cls, data: dict) -> "AnnotationData":
        raise NotImplementedError


@dataclass
class CircleAnnotation(AnnotationData):
    x: float = 0
    y: float = 0
    width: float = 0
    height: float = 0
    color: str = "#ff0000"
    thickness: int = 3
    fill_opacity: float = 0.0

    def __post_init__(self):
        self.ann_type = AnnotationType.CIRCLE

    def to_dict(self) -> dict:
        return {
            "type": "circle", "x": self.x, "y": self.y,
            "width": self.width, "height": self.height,
            "color": self.color, "thickness": self.thickness,
            "fill_opacity": self.fill_opacity,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CircleAnnotation":
        return cls(
            x=data["x"], y=data["y"], width=data["width"], height=data["height"],
            color=data.get("color", "#ff0000"), thickness=data.get("thickness", 3),
            fill_opacity=data.get("fill_opacity", 0.0),
        )


@dataclass
class RectAnnotation(AnnotationData):
    x: float = 0
    y: float = 0
    width: float = 0
    height: float = 0
    color: str = "#ff0000"
    thickness: int = 3
    fill_opacity: float = 0.0

    def __post_init__(self):
        self.ann_type = AnnotationType.RECT

    def to_dict(self) -> dict:
        return {
            "type": "rect", "x": self.x, "y": self.y,
            "width": self.width, "height": self.height,
            "color": self.color, "thickness": self.thickness,
            "fill_opacity": self.fill_opacity,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RectAnnotation":
        return cls(
            x=data["x"], y=data["y"], width=data["width"], height=data["height"],
            color=data.get("color", "#ff0000"), thickness=data.get("thickness", 3),
            fill_opacity=data.get("fill_opacity", 0.0),
        )


@dataclass
class ArrowAnnotation(AnnotationData):
    x1: float = 0
    y1: float = 0
    x2: float = 0
    y2: float = 0
    color: str = "#ff0000"
    thickness: int = 2

    def __post_init__(self):
        self.ann_type = AnnotationType.ARROW

    def to_dict(self) -> dict:
        return {
            "type": "arrow", "x1": self.x1, "y1": self.y1,
            "x2": self.x2, "y2": self.y2,
            "color": self.color, "thickness": self.thickness,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ArrowAnnotation":
        return cls(
            x1=data["x1"], y1=data["y1"], x2=data["x2"], y2=data["y2"],
            color=data.get("color", "#ff0000"), thickness=data.get("thickness", 2),
        )


@dataclass
class NumberMarkerAnnotation(AnnotationData):
    x: float = 0
    y: float = 0
    number: int = 1
    color: str = "#ff0000"
    size: int = 28

    def __post_init__(self):
        self.ann_type = AnnotationType.NUMBER_MARKER

    def to_dict(self) -> dict:
        return {
            "type": "number_marker", "x": self.x, "y": self.y,
            "number": self.number, "color": self.color, "size": self.size,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "NumberMarkerAnnotation":
        return cls(
            x=data["x"], y=data["y"], number=data["number"],
            color=data.get("color", "#ff0000"), size=data.get("size", 28),
        )


@dataclass
class HighlightAnnotation(AnnotationData):
    points: list[tuple[float, float]] = field(default_factory=list)
    color: str = "#ffff00"
    thickness: int = 20

    def __post_init__(self):
        self.ann_type = AnnotationType.HIGHLIGHT

    def to_dict(self) -> dict:
        return {
            "type": "highlight",
            "points": [list(p) for p in self.points],
            "color": self.color, "thickness": self.thickness,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "HighlightAnnotation":
        return cls(
            points=[tuple(p) for p in data["points"]],
            color=data.get("color", "#ffff00"),
            thickness=data.get("thickness", 20),
        )


@dataclass
class TextLabelAnnotation(AnnotationData):
    x: float = 0
    y: float = 0
    text: str = ""
    color: str = "#ffffff"
    font_size: int = 14
    bg_color: str = "#333333"

    def __post_init__(self):
        self.ann_type = AnnotationType.TEXT_LABEL

    def to_dict(self) -> dict:
        return {
            "type": "text_label", "x": self.x, "y": self.y,
            "text": self.text, "color": self.color,
            "font_size": self.font_size, "bg_color": self.bg_color,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "TextLabelAnnotation":
        return cls(
            x=data["x"], y=data["y"], text=data["text"],
            color=data.get("color", "#ffffff"),
            font_size=data.get("font_size", 14),
            bg_color=data.get("bg_color", "#333333"),
        )


@dataclass
class BlurAnnotation(AnnotationData):
    x: float = 0
    y: float = 0
    width: float = 0
    height: float = 0
    blur_radius: int = 15

    def __post_init__(self):
        self.ann_type = AnnotationType.BLUR

    def to_dict(self) -> dict:
        return {
            "type": "blur", "x": self.x, "y": self.y,
            "width": self.width, "height": self.height,
            "blur_radius": self.blur_radius,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "BlurAnnotation":
        return cls(
            x=data["x"], y=data["y"], width=data["width"], height=data["height"],
            blur_radius=data.get("blur_radius", 15),
        )


_TYPE_MAP = {
    "circle": CircleAnnotation,
    "rect": RectAnnotation,
    "arrow": ArrowAnnotation,
    "number_marker": NumberMarkerAnnotation,
    "highlight": HighlightAnnotation,
    "text_label": TextLabelAnnotation,
    "blur": BlurAnnotation,
}


def serialize_annotations(annotations: list[AnnotationData]) -> str:
    return json.dumps([a.to_dict() for a in annotations], indent=2)


def deserialize_annotations(json_str: str) -> list[AnnotationData]:
    data_list = json.loads(json_str)
    result = []
    for d in data_list:
        cls = _TYPE_MAP.get(d["type"])
        if cls:
            result.append(cls.from_dict(d))
    return result
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_annotations.py -v
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/annotations.py tests/test_annotations.py
git commit -m "feat: add annotation data models with serialization"
```

---

### Task 5: Annotation Canvas (QGraphicsScene)

**Files:**
- Create: `ui/canvas.py`

- [ ] **Step 1: Create the annotation canvas widget**

Create `ui/canvas.py`:

```python
import math
from PyQt6.QtWidgets import (
    QGraphicsView, QGraphicsScene, QGraphicsItem,
    QGraphicsEllipseItem, QGraphicsRectItem, QGraphicsLineItem,
    QGraphicsPathItem, QGraphicsTextItem, QGraphicsPixmapItem,
    QGraphicsItemGroup, QApplication,
)
from PyQt6.QtCore import Qt, QPointF, QRectF, pyqtSignal
from PyQt6.QtGui import (
    QPen, QBrush, QColor, QPainterPath, QPixmap, QFont,
    QPainter, QTransform, QKeyEvent, QWheelEvent,
)
from core.annotations import (
    AnnotationType, CircleAnnotation, RectAnnotation, ArrowAnnotation,
    NumberMarkerAnnotation, HighlightAnnotation, TextLabelAnnotation,
    BlurAnnotation, AnnotationData,
)


class AnnotationItem:
    """Mixin to tag QGraphicsItems as annotations with associated data."""
    def __init__(self):
        self.annotation_data: AnnotationData | None = None


class CircleItem(QGraphicsEllipseItem, AnnotationItem):
    def __init__(self, *args, **kwargs):
        QGraphicsEllipseItem.__init__(self, *args, **kwargs)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )


class RectItem(QGraphicsRectItem, AnnotationItem):
    def __init__(self, *args, **kwargs):
        QGraphicsRectItem.__init__(self, *args, **kwargs)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )


class ArrowItem(QGraphicsLineItem, AnnotationItem):
    def __init__(self, *args, **kwargs):
        QGraphicsLineItem.__init__(self, *args, **kwargs)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )

    def paint(self, painter, option, widget=None):
        super().paint(painter, option, widget)
        line = self.line()
        if line.length() == 0:
            return

        painter.setPen(self.pen())
        painter.setBrush(QBrush(self.pen().color()))

        angle = math.atan2(-line.dy(), line.dx())
        arrow_size = 12

        p1 = line.p2() - QPointF(
            math.cos(angle - math.pi / 6) * arrow_size,
            -math.sin(angle - math.pi / 6) * arrow_size,
        )
        p2 = line.p2() - QPointF(
            math.cos(angle + math.pi / 6) * arrow_size,
            -math.sin(angle + math.pi / 6) * arrow_size,
        )

        path = QPainterPath()
        path.moveTo(line.p2())
        path.lineTo(p1)
        path.lineTo(p2)
        path.closeSubpath()
        painter.drawPath(path)


class NumberMarkerItem(QGraphicsItemGroup, AnnotationItem):
    def __init__(self, number: int, color: str, size: int = 28):
        QGraphicsItemGroup.__init__(self)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )

        # Circle background
        circle = QGraphicsEllipseItem(-size / 2, -size / 2, size, size)
        circle.setPen(QPen(QColor(color), 2))
        circle.setBrush(QBrush(QColor(color)))
        self.addToGroup(circle)

        # Number text
        text = QGraphicsTextItem(str(number))
        font = QFont("Arial", int(size * 0.45), QFont.Weight.Bold)
        text.setFont(font)
        text.setDefaultTextColor(QColor("white"))
        br = text.boundingRect()
        text.setPos(-br.width() / 2, -br.height() / 2)
        self.addToGroup(text)


class HighlightItem(QGraphicsPathItem, AnnotationItem):
    def __init__(self, *args, **kwargs):
        QGraphicsPathItem.__init__(self, *args, **kwargs)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )


class TextLabelItem(QGraphicsItemGroup, AnnotationItem):
    def __init__(self, text: str, color: str, font_size: int, bg_color: str):
        QGraphicsItemGroup.__init__(self)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )

        text_item = QGraphicsTextItem(text)
        font = QFont("Arial", font_size)
        text_item.setFont(font)
        text_item.setDefaultTextColor(QColor(color))
        br = text_item.boundingRect()

        bg = QGraphicsRectItem(-4, -2, br.width() + 8, br.height() + 4)
        bg.setPen(QPen(QColor(color), 1))
        bg.setBrush(QBrush(QColor(bg_color)))
        bg.setOpacity(0.85)
        self.addToGroup(bg)
        self.addToGroup(text_item)
        self._text_item = text_item

    def get_text(self) -> str:
        return self._text_item.toPlainText()


class BlurItem(QGraphicsRectItem, AnnotationItem):
    def __init__(self, *args, **kwargs):
        QGraphicsRectItem.__init__(self, *args, **kwargs)
        AnnotationItem.__init__(self)
        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable |
            QGraphicsItem.GraphicsItemFlag.ItemIsMovable
        )

    def paint(self, painter, option, widget=None):
        rect = self.rect()
        painter.setPen(QPen(QColor("#888"), 1, Qt.PenStyle.DashLine))
        painter.setBrush(QBrush(QColor(0, 0, 0, 150)))
        painter.drawRect(rect)
        font = QFont("Arial", 10)
        painter.setFont(font)
        painter.setPen(QColor("white"))
        painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, "REDACTED")


class ToolMode:
    SELECT = "select"
    CIRCLE = "circle"
    RECT = "rect"
    ARROW = "arrow"
    NUMBER = "number"
    HIGHLIGHT = "highlight"
    TEXT = "text"
    BLUR = "blur"


class AnnotationCanvas(QGraphicsView):
    annotation_added = pyqtSignal()
    annotation_selected = pyqtSignal()
    zoom_changed = pyqtSignal(float)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._scene = QGraphicsScene(self)
        self.setScene(self._scene)
        self.setRenderHint(QPainter.RenderHint.Antialiasing)
        self.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)
        self.setDragMode(QGraphicsView.DragMode.NoDrag)
        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.AnchorUnderMouse)

        self._screenshot_item: QGraphicsPixmapItem | None = None
        self._tool_mode = ToolMode.SELECT
        self._current_color = "#ff0000"
        self._current_thickness = 3
        self._next_number = 1
        self._zoom_level = 1.0

        # Drawing state
        self._drawing = False
        self._start_point = QPointF()
        self._current_item = None
        self._highlight_points: list[QPointF] = []

        # Undo/Redo stacks
        self._undo_stack: list[QGraphicsItem] = []
        self._redo_stack: list[QGraphicsItem] = []

    def set_screenshot(self, pixmap: QPixmap):
        """Load a screenshot onto the canvas."""
        if self._screenshot_item:
            self._scene.removeItem(self._screenshot_item)
        self._screenshot_item = QGraphicsPixmapItem(pixmap)
        self._screenshot_item.setZValue(-1)
        self._scene.addItem(self._screenshot_item)
        self._scene.setSceneRect(QRectF(pixmap.rect()))
        self.fitInView(self._screenshot_item, Qt.AspectRatioMode.KeepAspectRatio)
        self._zoom_level = 1.0
        self.zoom_changed.emit(self._zoom_level)

    def get_screenshot_pixmap(self) -> QPixmap | None:
        if self._screenshot_item:
            return self._screenshot_item.pixmap()
        return None

    def set_tool(self, mode: str):
        self._tool_mode = mode
        if mode == ToolMode.SELECT:
            self.setDragMode(QGraphicsView.DragMode.RubberBandDrag)
        else:
            self.setDragMode(QGraphicsView.DragMode.NoDrag)

    def set_color(self, color: str):
        self._current_color = color

    def set_thickness(self, thickness: int):
        self._current_thickness = thickness

    def reset_number_counter(self):
        self._next_number = 1

    def get_annotation_items(self) -> list[QGraphicsItem]:
        """Return all annotation items (excluding the screenshot)."""
        items = []
        for item in self._scene.items():
            if isinstance(item, AnnotationItem) and item is not self._screenshot_item:
                items.append(item)
        return items

    def clear_annotations(self):
        for item in self.get_annotation_items():
            self._scene.removeItem(item)
        self._undo_stack.clear()
        self._redo_stack.clear()
        self._next_number = 1

    def render_to_pixmap(self) -> QPixmap:
        """Render the entire scene (screenshot + annotations) to a QPixmap."""
        rect = self._scene.sceneRect()
        pixmap = QPixmap(int(rect.width()), int(rect.height()))
        pixmap.fill(QColor("white"))
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        self._scene.render(painter, QRectF(pixmap.rect()), rect)
        painter.end()
        return pixmap

    def undo(self):
        if self._undo_stack:
            item = self._undo_stack.pop()
            self._scene.removeItem(item)
            self._redo_stack.append(item)

    def redo(self):
        if self._redo_stack:
            item = self._redo_stack.pop()
            self._scene.addItem(item)
            self._undo_stack.append(item)

    def delete_selected(self):
        for item in self._scene.selectedItems():
            if isinstance(item, AnnotationItem):
                self._scene.removeItem(item)
                if item in self._undo_stack:
                    self._undo_stack.remove(item)

    def _add_annotation_item(self, item: QGraphicsItem):
        self._scene.addItem(item)
        self._undo_stack.append(item)
        self._redo_stack.clear()
        self.annotation_added.emit()

    def mousePressEvent(self, event):
        if event.button() != Qt.MouseButton.LeftButton or self._tool_mode == ToolMode.SELECT:
            super().mousePressEvent(event)
            return

        self._drawing = True
        self._start_point = self.mapToScene(event.pos())
        pos = self._start_point

        if self._tool_mode == ToolMode.CIRCLE:
            item = CircleItem(0, 0, 0, 0)
            item.setPen(QPen(QColor(self._current_color), self._current_thickness))
            item.setPos(pos)
            self._current_item = item
            self._scene.addItem(item)

        elif self._tool_mode == ToolMode.RECT:
            item = RectItem(0, 0, 0, 0)
            item.setPen(QPen(QColor(self._current_color), self._current_thickness))
            item.setPos(pos)
            self._current_item = item
            self._scene.addItem(item)

        elif self._tool_mode == ToolMode.ARROW:
            item = ArrowItem(0, 0, 0, 0)
            item.setPen(QPen(QColor(self._current_color), self._current_thickness))
            item.setPos(pos)
            self._current_item = item
            self._scene.addItem(item)

        elif self._tool_mode == ToolMode.BLUR:
            item = BlurItem(0, 0, 0, 0)
            item.setPos(pos)
            self._current_item = item
            self._scene.addItem(item)

        elif self._tool_mode == ToolMode.HIGHLIGHT:
            self._highlight_points = [pos]
            path = QPainterPath()
            path.moveTo(pos)
            item = HighlightItem(path)
            color = QColor(self._current_color)
            color.setAlpha(80)
            item.setPen(QPen(color, self._current_thickness * 6, Qt.PenStyle.SolidLine,
                             Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin))
            self._current_item = item
            self._scene.addItem(item)

        elif self._tool_mode == ToolMode.NUMBER:
            marker = NumberMarkerItem(self._next_number, self._current_color)
            marker.setPos(pos)
            self._next_number += 1
            self._add_annotation_item(marker)
            self._drawing = False

        elif self._tool_mode == ToolMode.TEXT:
            text, ok = self._get_text_input()
            if ok and text:
                label = TextLabelItem(text, self._current_color, 14, "#333333")
                label.setPos(pos)
                self._add_annotation_item(label)
            self._drawing = False

    def _get_text_input(self) -> tuple[str, bool]:
        from PyQt6.QtWidgets import QInputDialog
        text, ok = QInputDialog.getText(self, "Add Text Label", "Text:")
        return text, ok

    def mouseMoveEvent(self, event):
        if not self._drawing or not self._current_item:
            super().mouseMoveEvent(event)
            return

        current = self.mapToScene(event.pos())
        dx = current.x() - self._start_point.x()
        dy = current.y() - self._start_point.y()

        if self._tool_mode in (ToolMode.CIRCLE, ToolMode.RECT, ToolMode.BLUR):
            x = min(0, dx)
            y = min(0, dy)
            w = abs(dx)
            h = abs(dy)
            if isinstance(self._current_item, (CircleItem, QGraphicsEllipseItem)):
                self._current_item.setRect(x, y, w, h)
            else:
                self._current_item.setRect(x, y, w, h)

        elif self._tool_mode == ToolMode.ARROW:
            self._current_item.setLine(0, 0, dx, dy)

        elif self._tool_mode == ToolMode.HIGHLIGHT:
            self._highlight_points.append(current)
            path = QPainterPath()
            path.moveTo(self._highlight_points[0])
            for pt in self._highlight_points[1:]:
                path.lineTo(pt)
            self._current_item.setPath(path)

    def mouseReleaseEvent(self, event):
        if event.button() != Qt.MouseButton.LeftButton or not self._drawing:
            super().mouseReleaseEvent(event)
            return

        self._drawing = False
        if self._current_item:
            self._undo_stack.append(self._current_item)
            self._redo_stack.clear()
            self.annotation_added.emit()
            self._current_item = None

    def wheelEvent(self, event: QWheelEvent):
        factor = 1.15
        if event.angleDelta().y() > 0:
            self._zoom_level *= factor
            self.scale(factor, factor)
        else:
            self._zoom_level /= factor
            self.scale(1 / factor, 1 / factor)
        self.zoom_changed.emit(self._zoom_level)

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key.Key_Delete:
            self.delete_selected()
        else:
            super().keyPressEvent(event)

    def load_annotations_from_data(self, annotations: list[AnnotationData]):
        """Rebuild annotation graphics items from saved data."""
        for ann in annotations:
            if isinstance(ann, CircleAnnotation):
                item = CircleItem(0, 0, ann.width, ann.height)
                item.setPen(QPen(QColor(ann.color), ann.thickness))
                if ann.fill_opacity > 0:
                    c = QColor(ann.color)
                    c.setAlphaF(ann.fill_opacity)
                    item.setBrush(QBrush(c))
                item.setPos(ann.x, ann.y)
                item.annotation_data = ann
                self._add_annotation_item(item)

            elif isinstance(ann, RectAnnotation):
                item = RectItem(0, 0, ann.width, ann.height)
                item.setPen(QPen(QColor(ann.color), ann.thickness))
                if ann.fill_opacity > 0:
                    c = QColor(ann.color)
                    c.setAlphaF(ann.fill_opacity)
                    item.setBrush(QBrush(c))
                item.setPos(ann.x, ann.y)
                item.annotation_data = ann
                self._add_annotation_item(item)

            elif isinstance(ann, ArrowAnnotation):
                item = ArrowItem(0, 0, ann.x2 - ann.x1, ann.y2 - ann.y1)
                item.setPen(QPen(QColor(ann.color), ann.thickness))
                item.setPos(ann.x1, ann.y1)
                item.annotation_data = ann
                self._add_annotation_item(item)

            elif isinstance(ann, NumberMarkerAnnotation):
                item = NumberMarkerItem(ann.number, ann.color, ann.size)
                item.setPos(ann.x, ann.y)
                item.annotation_data = ann
                self._add_annotation_item(item)

            elif isinstance(ann, HighlightAnnotation):
                if ann.points:
                    path = QPainterPath()
                    path.moveTo(QPointF(*ann.points[0]))
                    for pt in ann.points[1:]:
                        path.lineTo(QPointF(*pt))
                    item = HighlightItem(path)
                    color = QColor(ann.color)
                    color.setAlpha(80)
                    item.setPen(QPen(color, ann.thickness, Qt.PenStyle.SolidLine,
                                     Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin))
                    item.annotation_data = ann
                    self._add_annotation_item(item)

            elif isinstance(ann, TextLabelAnnotation):
                item = TextLabelItem(ann.text, ann.color, ann.font_size, ann.bg_color)
                item.setPos(ann.x, ann.y)
                item.annotation_data = ann
                self._add_annotation_item(item)

            elif isinstance(ann, BlurAnnotation):
                item = BlurItem(0, 0, ann.width, ann.height)
                item.setPos(ann.x, ann.y)
                item.annotation_data = ann
                self._add_annotation_item(item)

    def extract_annotation_data(self) -> list[AnnotationData]:
        """Extract annotation data from all graphics items for saving."""
        result = []
        for item in self.get_annotation_items():
            if isinstance(item, CircleItem):
                r = item.rect()
                pos = item.pos()
                result.append(CircleAnnotation(
                    x=pos.x(), y=pos.y(), width=r.width(), height=r.height(),
                    color=item.pen().color().name(), thickness=item.pen().width(),
                ))
            elif isinstance(item, RectItem):
                r = item.rect()
                pos = item.pos()
                result.append(RectAnnotation(
                    x=pos.x(), y=pos.y(), width=r.width(), height=r.height(),
                    color=item.pen().color().name(), thickness=item.pen().width(),
                ))
            elif isinstance(item, ArrowItem):
                line = item.line()
                pos = item.pos()
                result.append(ArrowAnnotation(
                    x1=pos.x(), y1=pos.y(),
                    x2=pos.x() + line.x2(), y2=pos.y() + line.y2(),
                    color=item.pen().color().name(), thickness=item.pen().width(),
                ))
            elif isinstance(item, NumberMarkerItem):
                pos = item.pos()
                data = item.annotation_data
                num = data.number if data else 1
                result.append(NumberMarkerAnnotation(x=pos.x(), y=pos.y(), number=num,
                                                      color=self._current_color))
            elif isinstance(item, HighlightItem):
                path = item.path()
                points = []
                for i in range(path.elementCount()):
                    e = path.elementAt(i)
                    points.append((e.x, e.y))
                result.append(HighlightAnnotation(
                    points=points, color=item.pen().color().name(),
                    thickness=item.pen().width(),
                ))
            elif isinstance(item, TextLabelItem):
                pos = item.pos()
                result.append(TextLabelAnnotation(
                    x=pos.x(), y=pos.y(), text=item.get_text(),
                    color=self._current_color,
                ))
            elif isinstance(item, BlurItem):
                r = item.rect()
                pos = item.pos()
                result.append(BlurAnnotation(
                    x=pos.x(), y=pos.y(), width=r.width(), height=r.height(),
                ))
        return result
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.canvas import AnnotationCanvas, ToolMode; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/canvas.py
git commit -m "feat: add annotation canvas with all drawing tools"
```

---

### Task 6: Rich Text Editor with Templates

**Files:**
- Create: `ui/text_editor.py`

- [ ] **Step 1: Create the text editor widget**

Create `ui/text_editor.py`:

```python
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, QToolButton,
    QComboBox, QMenu, QWidgetAction, QLabel,
)
from PyQt6.QtCore import Qt, pyqtSignal, QRegularExpression
from PyQt6.QtGui import (
    QFont, QTextCharFormat, QTextCursor, QTextListFormat,
    QAction, QColor, QKeySequence,
)


TEMPLATES = [
    ("Click button", 'Click the <b>[Button]</b> button'),
    ("Navigate menu", 'Navigate to <b>[Menu]</b> &gt; <b>[Submenu]</b>'),
    ("Enter value", 'Enter <b>[value]</b> in the <b>[Field]</b> field'),
    ("Select dropdown", 'Select <b>[Option]</b> from the dropdown'),
    ("Checkbox", 'Check/Uncheck the <b>[Setting]</b> checkbox'),
    ("Right-click", 'Right-click on <b>[Element]</b> and select <b>[Option]</b>'),
]


class DirectionTextEditor(QWidget):
    text_changed = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        # Formatting toolbar
        toolbar = QHBoxLayout()
        toolbar.setSpacing(4)

        self._bold_btn = QToolButton()
        self._bold_btn.setText("B")
        self._bold_btn.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        self._bold_btn.setCheckable(True)
        self._bold_btn.clicked.connect(self._toggle_bold)
        toolbar.addWidget(self._bold_btn)

        self._italic_btn = QToolButton()
        self._italic_btn.setText("I")
        font = QFont("Arial", 10)
        font.setItalic(True)
        self._italic_btn.setFont(font)
        self._italic_btn.setCheckable(True)
        self._italic_btn.clicked.connect(self._toggle_italic)
        toolbar.addWidget(self._italic_btn)

        self._underline_btn = QToolButton()
        self._underline_btn.setText("U")
        font = QFont("Arial", 10)
        font.setUnderline(True)
        self._underline_btn.setFont(font)
        self._underline_btn.setCheckable(True)
        self._underline_btn.clicked.connect(self._toggle_underline)
        toolbar.addWidget(self._underline_btn)

        # Separator
        sep = QLabel("|")
        sep.setStyleSheet("color: #555;")
        toolbar.addWidget(sep)

        self._bullet_btn = QToolButton()
        self._bullet_btn.setText("• List")
        self._bullet_btn.clicked.connect(self._insert_bullet_list)
        toolbar.addWidget(self._bullet_btn)

        self._number_btn = QToolButton()
        self._number_btn.setText("1. List")
        self._number_btn.clicked.connect(self._insert_numbered_list)
        toolbar.addWidget(self._number_btn)

        # Separator
        sep2 = QLabel("|")
        sep2.setStyleSheet("color: #555;")
        toolbar.addWidget(sep2)

        # Font size
        self._font_size = QComboBox()
        self._font_size.addItems(["10", "11", "12", "14", "16", "18", "20", "24"])
        self._font_size.setCurrentText("12")
        self._font_size.currentTextChanged.connect(self._change_font_size)
        toolbar.addWidget(QLabel("Size:"))
        toolbar.addWidget(self._font_size)

        # Separator
        sep3 = QLabel("|")
        sep3.setStyleSheet("color: #555;")
        toolbar.addWidget(sep3)

        # Templates
        self._template_btn = QToolButton()
        self._template_btn.setText("Templates")
        self._template_btn.setPopupMode(QToolButton.ToolButtonPopupMode.InstantPopup)
        template_menu = QMenu(self)
        for name, html in TEMPLATES:
            action = template_menu.addAction(name)
            action.setData(html)
            action.triggered.connect(lambda checked, h=html: self._insert_template(h))
        self._template_btn.setMenu(template_menu)
        toolbar.addWidget(self._template_btn)

        toolbar.addStretch()
        layout.addLayout(toolbar)

        # Text editor
        self._editor = QTextEdit()
        self._editor.setFont(QFont("Arial", 12))
        self._editor.setPlaceholderText("Type step directions here...")
        self._editor.setMinimumHeight(80)
        self._editor.setMaximumHeight(200)
        self._editor.textChanged.connect(self.text_changed.emit)
        self._editor.cursorPositionChanged.connect(self._update_format_buttons)
        layout.addWidget(self._editor)

    def get_html(self) -> str:
        return self._editor.toHtml()

    def set_html(self, html: str):
        self._editor.setHtml(html)

    def get_plain_text(self) -> str:
        return self._editor.toPlainText()

    def clear(self):
        self._editor.clear()

    def _toggle_bold(self):
        fmt = QTextCharFormat()
        if self._bold_btn.isChecked():
            fmt.setFontWeight(QFont.Weight.Bold)
        else:
            fmt.setFontWeight(QFont.Weight.Normal)
        self._editor.textCursor().mergeCharFormat(fmt)

    def _toggle_italic(self):
        fmt = QTextCharFormat()
        fmt.setFontItalic(self._italic_btn.isChecked())
        self._editor.textCursor().mergeCharFormat(fmt)

    def _toggle_underline(self):
        fmt = QTextCharFormat()
        fmt.setFontUnderline(self._underline_btn.isChecked())
        self._editor.textCursor().mergeCharFormat(fmt)

    def _insert_bullet_list(self):
        cursor = self._editor.textCursor()
        cursor.insertList(QTextListFormat.Style.ListDisc)

    def _insert_numbered_list(self):
        cursor = self._editor.textCursor()
        cursor.insertList(QTextListFormat.Style.ListDecimal)

    def _change_font_size(self, size_str: str):
        try:
            size = int(size_str)
        except ValueError:
            return
        fmt = QTextCharFormat()
        fmt.setFontPointSize(size)
        self._editor.textCursor().mergeCharFormat(fmt)

    def _insert_template(self, html: str):
        cursor = self._editor.textCursor()
        cursor.insertHtml(html)
        # Select first placeholder for easy editing
        self._editor.setTextCursor(cursor)
        self._select_next_placeholder()

    def _select_next_placeholder(self):
        """Find and select the next [placeholder] in the text."""
        text = self._editor.toPlainText()
        cursor = self._editor.textCursor()
        pos = cursor.position()
        start = text.find("[", pos)
        if start == -1:
            start = text.find("[")
        if start == -1:
            return
        end = text.find("]", start)
        if end == -1:
            return
        cursor.setPosition(start)
        cursor.setPosition(end + 1, QTextCursor.MoveMode.KeepAnchor)
        self._editor.setTextCursor(cursor)

    def _update_format_buttons(self):
        fmt = self._editor.currentCharFormat()
        self._bold_btn.setChecked(fmt.fontWeight() == QFont.Weight.Bold)
        self._italic_btn.setChecked(fmt.fontItalic())
        self._underline_btn.setChecked(fmt.fontUnderline())

    def keyPressEvent(self, event):
        if event.key() == Qt.Key.Key_Tab:
            self._select_next_placeholder()
            return
        super().keyPressEvent(event)
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.text_editor import DirectionTextEditor; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/text_editor.py
git commit -m "feat: add rich text editor with formatting and templates"
```

---

### Task 7: Sidebar Navigator

**Files:**
- Create: `ui/sidebar.py`

- [ ] **Step 1: Create the sidebar widget**

Create `ui/sidebar.py`:

```python
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QTreeWidget, QTreeWidgetItem,
    QPushButton, QHBoxLayout, QMenu, QInputDialog, QMessageBox,
    QAbstractItemView,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QAction, QFont
from core.project import Project, Section, Step


class SidebarNavigator(QWidget):
    step_selected = pyqtSignal(str, str)  # section_id, step_id
    project_modified = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._project: Project | None = None
        layout = QVBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)

        # Header buttons
        btn_row = QHBoxLayout()
        self._add_section_btn = QPushButton("+ Section")
        self._add_section_btn.clicked.connect(self._add_section)
        btn_row.addWidget(self._add_section_btn)
        self._add_step_btn = QPushButton("+ Step")
        self._add_step_btn.clicked.connect(self._add_step)
        btn_row.addWidget(self._add_step_btn)
        layout.addLayout(btn_row)

        # Tree widget
        self._tree = QTreeWidget()
        self._tree.setHeaderHidden(True)
        self._tree.setDragDropMode(QAbstractItemView.DragDropMode.InternalMove)
        self._tree.setDefaultDropAction(Qt.DropAction.MoveAction)
        self._tree.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self._tree.customContextMenuRequested.connect(self._show_context_menu)
        self._tree.currentItemChanged.connect(self._on_item_changed)
        self._tree.setFont(QFont("Arial", 10))
        layout.addWidget(self._tree)

    def set_project(self, project: Project):
        self._project = project
        self.refresh_tree()

    def refresh_tree(self):
        self._tree.clear()
        if not self._project:
            return

        for section in self._project.sections:
            section_item = QTreeWidgetItem([section.title])
            section_item.setData(0, Qt.ItemDataRole.UserRole, ("section", section.section_id))
            section_item.setFont(0, QFont("Arial", 11, QFont.Weight.Bold))
            section_item.setFlags(
                section_item.flags() | Qt.ItemFlag.ItemIsDropEnabled
            )
            self._tree.addTopLevelItem(section_item)

            for step in section.steps:
                step_item = QTreeWidgetItem([step.title])
                step_item.setData(0, Qt.ItemDataRole.UserRole, ("step", section.section_id, step.step_id))
                step_item.setFlags(
                    step_item.flags() | Qt.ItemFlag.ItemIsDragEnabled
                )
                section_item.addChild(step_item)

            section_item.setExpanded(True)

        # Select first step if available
        if self._project.sections and self._project.sections[0].steps:
            first_section = self._tree.topLevelItem(0)
            if first_section and first_section.childCount() > 0:
                self._tree.setCurrentItem(first_section.child(0))

    def _on_item_changed(self, current, previous):
        if not current:
            return
        data = current.data(0, Qt.ItemDataRole.UserRole)
        if data and data[0] == "step":
            self.step_selected.emit(data[1], data[2])

    def _add_section(self):
        if not self._project:
            return
        title, ok = QInputDialog.getText(self, "New Section", "Section title:")
        if ok and title:
            self._project.add_section(title)
            self.refresh_tree()
            self.project_modified.emit()

    def _add_step(self):
        if not self._project:
            return
        current = self._tree.currentItem()
        if not current:
            return
        data = current.data(0, Qt.ItemDataRole.UserRole)
        if not data:
            return

        if data[0] == "section":
            section_id = data[1]
        elif data[0] == "step":
            section_id = data[1]
        else:
            return

        title, ok = QInputDialog.getText(self, "New Step", "Step title:")
        if ok and title:
            section = self._project.get_section(section_id)
            if section:
                section.add_step(Step(title=title))
                self.refresh_tree()
                self.project_modified.emit()

    def _show_context_menu(self, position):
        item = self._tree.itemAt(position)
        if not item:
            return
        data = item.data(0, Qt.ItemDataRole.UserRole)
        if not data:
            return

        menu = QMenu(self)

        if data[0] == "section":
            rename_action = menu.addAction("Rename Section")
            rename_action.triggered.connect(lambda: self._rename_section(data[1]))
            add_step_action = menu.addAction("Add Step")
            add_step_action.triggered.connect(lambda: self._add_step_to_section(data[1]))
            menu.addSeparator()
            delete_action = menu.addAction("Delete Section")
            delete_action.triggered.connect(lambda: self._delete_section(data[1]))

        elif data[0] == "step":
            rename_action = menu.addAction("Rename Step")
            rename_action.triggered.connect(lambda: self._rename_step(data[1], data[2]))
            duplicate_action = menu.addAction("Duplicate Step")
            duplicate_action.triggered.connect(lambda: self._duplicate_step(data[1], data[2]))
            menu.addSeparator()
            delete_action = menu.addAction("Delete Step")
            delete_action.triggered.connect(lambda: self._delete_step(data[1], data[2]))

        menu.exec(self._tree.mapToGlobal(position))

    def _rename_section(self, section_id: str):
        section = self._project.get_section(section_id)
        if not section:
            return
        title, ok = QInputDialog.getText(self, "Rename Section", "New title:", text=section.title)
        if ok and title:
            section.title = title
            self.refresh_tree()
            self.project_modified.emit()

    def _add_step_to_section(self, section_id: str):
        section = self._project.get_section(section_id)
        if not section:
            return
        title, ok = QInputDialog.getText(self, "New Step", "Step title:")
        if ok and title:
            section.add_step(Step(title=title))
            self.refresh_tree()
            self.project_modified.emit()

    def _rename_step(self, section_id: str, step_id: str):
        section = self._project.get_section(section_id)
        if not section:
            return
        for step in section.steps:
            if step.step_id == step_id:
                title, ok = QInputDialog.getText(self, "Rename Step", "New title:", text=step.title)
                if ok and title:
                    step.title = title
                    self.refresh_tree()
                    self.project_modified.emit()
                return

    def _duplicate_step(self, section_id: str, step_id: str):
        if self._project:
            self._project.duplicate_step(section_id, step_id)
            self.refresh_tree()
            self.project_modified.emit()

    def _delete_step(self, section_id: str, step_id: str):
        reply = QMessageBox.question(
            self, "Delete Step", "Are you sure you want to delete this step?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            section = self._project.get_section(section_id)
            if section:
                section.remove_step(step_id)
                self.refresh_tree()
                self.project_modified.emit()

    def _delete_section(self, section_id: str):
        reply = QMessageBox.question(
            self, "Delete Section", "Delete this section and all its steps?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            self._project.remove_section(section_id)
            self.refresh_tree()
            self.project_modified.emit()
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.sidebar import SidebarNavigator; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/sidebar.py
git commit -m "feat: add sidebar navigator with sections and steps"
```

---

### Task 8: Toolbar

**Files:**
- Create: `ui/toolbar.py`

- [ ] **Step 1: Create the annotation toolbar**

Create `ui/toolbar.py`:

```python
from PyQt6.QtWidgets import (
    QToolBar, QToolButton, QSlider, QLabel, QColorDialog,
    QWidget, QHBoxLayout, QButtonGroup,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QIcon, QPixmap, QPainter, QFont, QAction
from ui.canvas import ToolMode


PRESET_COLORS = [
    "#ff0000", "#ff8800", "#ffff00", "#00cc00",
    "#0088ff", "#8800ff", "#000000", "#ffffff",
]


class ColorButton(QToolButton):
    def __init__(self, color: str, parent=None):
        super().__init__(parent)
        self.color = color
        self.setFixedSize(24, 24)
        self.setCheckable(True)
        self._update_style()

    def _update_style(self):
        border = "2px solid white" if self.isChecked() else "2px solid #555"
        self.setStyleSheet(
            f"background-color: {self.color}; border: {border}; border-radius: 12px;"
        )

    def setChecked(self, checked):
        super().setChecked(checked)
        self._update_style()


class AnnotationToolbar(QToolBar):
    tool_changed = pyqtSignal(str)
    color_changed = pyqtSignal(str)
    thickness_changed = pyqtSignal(int)
    capture_requested = pyqtSignal()
    undo_requested = pyqtSignal()
    redo_requested = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__("Annotation Tools", parent)
        self.setMovable(False)
        self._current_color = "#ff0000"

        # Capture button
        self._capture_btn = QPushButton_styled("Capture", "#e94560")
        self._capture_btn.setObjectName("captureButton")
        self._capture_btn.clicked.connect(self.capture_requested.emit)
        self.addWidget(self._capture_btn)
        self.addSeparator()

        # Tool buttons
        self._tool_group = QButtonGroup(self)
        self._tool_group.setExclusive(True)

        tools = [
            ("Select", ToolMode.SELECT, "S"),
            ("Circle", ToolMode.CIRCLE, "O"),
            ("Rect", ToolMode.RECT, "R"),
            ("Arrow", ToolMode.ARROW, "A"),
            ("123", ToolMode.NUMBER, "#"),
            ("Highlight", ToolMode.HIGHLIGHT, "H"),
            ("Text", ToolMode.TEXT, "T"),
            ("Blur", ToolMode.BLUR, "B"),
        ]

        self._tool_buttons = {}
        for label, mode, shortcut in tools:
            btn = QToolButton()
            btn.setText(label)
            btn.setCheckable(True)
            btn.setToolTip(f"{label} ({shortcut})")
            btn.clicked.connect(lambda checked, m=mode: self._on_tool_clicked(m))
            self._tool_group.addButton(btn)
            self.addWidget(btn)
            self._tool_buttons[mode] = btn

        self._tool_buttons[ToolMode.SELECT].setChecked(True)

        self.addSeparator()

        # Color palette
        self._color_group = QButtonGroup(self)
        self._color_group.setExclusive(True)
        self._color_buttons = []
        for color in PRESET_COLORS:
            btn = ColorButton(color)
            btn.clicked.connect(lambda checked, c=color: self._on_color_clicked(c))
            self._color_group.addButton(btn)
            self.addWidget(btn)
            self._color_buttons.append(btn)

        self._color_buttons[0].setChecked(True)

        # Custom color
        self._custom_color_btn = QToolButton()
        self._custom_color_btn.setText("+")
        self._custom_color_btn.setToolTip("Custom color")
        self._custom_color_btn.clicked.connect(self._pick_custom_color)
        self.addWidget(self._custom_color_btn)

        self.addSeparator()

        # Thickness
        thickness_label = QLabel(" Width: ")
        self.addWidget(thickness_label)
        self._thickness_slider = QSlider(Qt.Orientation.Horizontal)
        self._thickness_slider.setRange(1, 10)
        self._thickness_slider.setValue(3)
        self._thickness_slider.setFixedWidth(100)
        self._thickness_slider.valueChanged.connect(self._on_thickness_changed)
        self.addWidget(self._thickness_slider)

        self.addSeparator()

        # Undo / Redo
        undo_btn = QToolButton()
        undo_btn.setText("Undo")
        undo_btn.clicked.connect(self.undo_requested.emit)
        self.addWidget(undo_btn)

        redo_btn = QToolButton()
        redo_btn.setText("Redo")
        redo_btn.clicked.connect(self.redo_requested.emit)
        self.addWidget(redo_btn)

    def _on_tool_clicked(self, mode: str):
        self.tool_changed.emit(mode)

    def _on_color_clicked(self, color: str):
        self._current_color = color
        for btn in self._color_buttons:
            btn._update_style()
        self.color_changed.emit(color)

    def _pick_custom_color(self):
        color = QColorDialog.getColor(QColor(self._current_color), self)
        if color.isValid():
            self._current_color = color.name()
            # Uncheck all preset buttons
            checked = self._color_group.checkedButton()
            if checked:
                self._color_group.setExclusive(False)
                checked.setChecked(False)
                self._color_group.setExclusive(True)
            self.color_changed.emit(self._current_color)

    def _on_thickness_changed(self, value: int):
        self.thickness_changed.emit(value)

    def select_tool_by_key(self, key: int):
        """Select tool by keyboard number 1-8."""
        modes = [
            ToolMode.SELECT, ToolMode.CIRCLE, ToolMode.RECT, ToolMode.ARROW,
            ToolMode.NUMBER, ToolMode.HIGHLIGHT, ToolMode.TEXT, ToolMode.BLUR,
        ]
        if 1 <= key <= len(modes):
            mode = modes[key - 1]
            self._tool_buttons[mode].setChecked(True)
            self.tool_changed.emit(mode)


class QPushButton_styled(QToolButton):
    """A styled push button for the toolbar."""
    def __init__(self, text, color, parent=None):
        super().__init__(parent)
        self.setText(text)
        self.setStyleSheet(
            f"background-color: {color}; color: white; font-weight: bold; "
            f"border: none; border-radius: 4px; padding: 6px 16px;"
        )
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.toolbar import AnnotationToolbar; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/toolbar.py
git commit -m "feat: add annotation toolbar with tools and color picker"
```

---

### Task 9: Capture Overlay (Countdown)

**Files:**
- Create: `ui/capture_overlay.py`

- [ ] **Step 1: Create the capture overlay widget**

Create `ui/capture_overlay.py`:

```python
from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout, QApplication
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QFont, QPainter, QColor


class CaptureOverlay(QWidget):
    countdown_finished = pyqtSignal()

    def __init__(self, seconds: int = 3, parent=None):
        super().__init__(parent)
        self._seconds = seconds
        self._remaining = seconds

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # Full screen overlay
        screen = QApplication.primaryScreen()
        if screen:
            self.setGeometry(screen.geometry())

        self._timer = QTimer(self)
        self._timer.setInterval(1000)
        self._timer.timeout.connect(self._tick)

    def start(self):
        if self._seconds <= 0:
            self.countdown_finished.emit()
            return
        self._remaining = self._seconds
        self.show()
        self._timer.start()

    def _tick(self):
        self._remaining -= 1
        if self._remaining <= 0:
            self._timer.stop()
            self.hide()
            self.countdown_finished.emit()
        else:
            self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Semi-transparent background
        painter.fillRect(self.rect(), QColor(0, 0, 0, 120))

        # Big countdown number
        painter.setPen(QColor(255, 255, 255))
        font = QFont("Arial", 120, QFont.Weight.Bold)
        painter.setFont(font)
        painter.drawText(self.rect(), Qt.AlignmentFlag.AlignCenter, str(self._remaining))

        # Label
        painter.setPen(QColor(200, 200, 200))
        small_font = QFont("Arial", 20)
        painter.setFont(small_font)
        rect = self.rect()
        rect.setTop(rect.center().y() + 80)
        painter.drawText(rect, Qt.AlignmentFlag.AlignHCenter | Qt.AlignmentFlag.AlignTop,
                         "Capturing in...")

        painter.end()
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.capture_overlay import CaptureOverlay; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/capture_overlay.py
git commit -m "feat: add countdown overlay for screenshot capture"
```

---

### Task 10: Welcome Screen

**Files:**
- Create: `ui/welcome_screen.py`

- [ ] **Step 1: Create the welcome screen widget**

Create `ui/welcome_screen.py`:

```python
import os
import json
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QListWidget, QListWidgetItem, QFileDialog,
)
from PyQt6.QtCore import Qt, pyqtSignal, QStandardPaths
from PyQt6.QtGui import QFont


RECENT_PROJECTS_FILE = os.path.join(
    QStandardPaths.writableLocation(QStandardPaths.StandardLocation.AppDataLocation) or ".",
    "InstructionMaker",
    "recent_projects.json",
)


class WelcomeScreen(QWidget):
    new_project_requested = pyqtSignal()
    open_project_requested = pyqtSignal(str)  # project path

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(20)

        # Title
        title = QLabel("Instruction Maker")
        title.setFont(QFont("Arial", 28, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("color: #4fc3f7;")
        layout.addWidget(title)

        subtitle = QLabel("Create professional software instruction documents")
        subtitle.setFont(QFont("Arial", 12))
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet("color: #888;")
        layout.addWidget(subtitle)

        # Buttons
        btn_row = QHBoxLayout()
        btn_row.setAlignment(Qt.AlignmentFlag.AlignCenter)

        new_btn = QPushButton("New Project")
        new_btn.setFont(QFont("Arial", 12))
        new_btn.setFixedSize(160, 44)
        new_btn.setObjectName("captureButton")
        new_btn.clicked.connect(self.new_project_requested.emit)
        btn_row.addWidget(new_btn)

        open_btn = QPushButton("Open Project")
        open_btn.setFont(QFont("Arial", 12))
        open_btn.setFixedSize(160, 44)
        open_btn.clicked.connect(self._open_project)
        btn_row.addWidget(open_btn)

        layout.addLayout(btn_row)

        # Recent projects
        recent_label = QLabel("Recent Projects")
        recent_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        recent_label.setStyleSheet("color: #4fc3f7;")
        layout.addWidget(recent_label)

        self._recent_list = QListWidget()
        self._recent_list.setMaximumWidth(500)
        self._recent_list.setMaximumHeight(200)
        self._recent_list.setFont(QFont("Arial", 11))
        self._recent_list.itemDoubleClicked.connect(self._on_recent_clicked)
        layout.addWidget(self._recent_list, alignment=Qt.AlignmentFlag.AlignCenter)

        self._load_recent_projects()

    def _load_recent_projects(self):
        self._recent_list.clear()
        try:
            if os.path.isfile(RECENT_PROJECTS_FILE):
                with open(RECENT_PROJECTS_FILE, "r") as f:
                    projects = json.load(f)
                for proj in projects:
                    if os.path.isdir(proj.get("path", "")):
                        item = QListWidgetItem(f"{proj['name']}  —  {proj['path']}")
                        item.setData(Qt.ItemDataRole.UserRole, proj["path"])
                        self._recent_list.addItem(item)
        except (json.JSONDecodeError, KeyError):
            pass

        if self._recent_list.count() == 0:
            item = QListWidgetItem("No recent projects")
            item.setFlags(Qt.ItemFlag.NoItemFlags)
            self._recent_list.addItem(item)

    def _open_project(self):
        path = QFileDialog.getExistingDirectory(self, "Open Project Folder")
        if path and os.path.isfile(os.path.join(path, "project.json")):
            self.open_project_requested.emit(path)

    def _on_recent_clicked(self, item: QListWidgetItem):
        path = item.data(Qt.ItemDataRole.UserRole)
        if path and os.path.isdir(path):
            self.open_project_requested.emit(path)

    @staticmethod
    def add_to_recent(name: str, path: str):
        os.makedirs(os.path.dirname(RECENT_PROJECTS_FILE), exist_ok=True)
        projects = []
        try:
            if os.path.isfile(RECENT_PROJECTS_FILE):
                with open(RECENT_PROJECTS_FILE, "r") as f:
                    projects = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            pass

        # Remove duplicate
        projects = [p for p in projects if p.get("path") != path]
        # Add to front
        projects.insert(0, {"name": name, "path": path})
        # Keep only last 10
        projects = projects[:10]

        with open(RECENT_PROJECTS_FILE, "w") as f:
            json.dump(projects, f, indent=2)
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.welcome_screen import WelcomeScreen; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/welcome_screen.py
git commit -m "feat: add welcome screen with recent projects"
```

---

### Task 11: Export Dialog

**Files:**
- Create: `ui/export_dialog.py`

- [ ] **Step 1: Create the export dialog**

Create `ui/export_dialog.py`:

```python
import os
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QGroupBox, QRadioButton,
    QCheckBox, QLabel, QPushButton, QFileDialog, QLineEdit,
    QComboBox, QFormLayout,
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont


class ExportDialog(QDialog):
    def __init__(self, project_name: str, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Export Instructions")
        self.setFixedWidth(450)
        self._project_name = project_name
        self.result_format = None
        self.result_path = None
        self.result_settings = {}

        layout = QVBoxLayout(self)

        # Format selection
        format_group = QGroupBox("Output Format")
        format_layout = QVBoxLayout(format_group)
        self._pdf_radio = QRadioButton("PDF")
        self._pdf_radio.setChecked(True)
        self._docx_radio = QRadioButton("Word (.docx)")
        self._both_radio = QRadioButton("Both PDF and Word")
        format_layout.addWidget(self._pdf_radio)
        format_layout.addWidget(self._docx_radio)
        format_layout.addWidget(self._both_radio)
        layout.addWidget(format_group)

        # Page settings
        page_group = QGroupBox("Page Settings")
        page_form = QFormLayout(page_group)
        self._page_size = QComboBox()
        self._page_size.addItems(["Letter", "A4"])
        page_form.addRow("Page Size:", self._page_size)

        self._header_text = QLineEdit()
        self._header_text.setPlaceholderText("e.g., Company Name - Instruction Guide")
        page_form.addRow("Header Text:", self._header_text)

        layout.addWidget(page_group)

        # Output path
        path_group = QGroupBox("Save Location")
        path_layout = QHBoxLayout(path_group)
        self._path_input = QLineEdit()
        self._path_input.setPlaceholderText("Choose output folder...")
        path_layout.addWidget(self._path_input)
        browse_btn = QPushButton("Browse")
        browse_btn.clicked.connect(self._browse_path)
        path_layout.addWidget(browse_btn)
        layout.addWidget(path_group)

        # Options
        self._open_after = QCheckBox("Open file after export")
        self._open_after.setChecked(True)
        layout.addWidget(self._open_after)

        # Buttons
        btn_row = QHBoxLayout()
        btn_row.addStretch()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(self.reject)
        btn_row.addWidget(cancel_btn)
        export_btn = QPushButton("Export")
        export_btn.setObjectName("captureButton")
        export_btn.clicked.connect(self._do_export)
        btn_row.addWidget(export_btn)
        layout.addLayout(btn_row)

    def _browse_path(self):
        path = QFileDialog.getExistingDirectory(self, "Choose Export Folder")
        if path:
            self._path_input.setText(path)

    def _do_export(self):
        if not self._path_input.text():
            self._browse_path()
            if not self._path_input.text():
                return

        if self._pdf_radio.isChecked():
            self.result_format = "pdf"
        elif self._docx_radio.isChecked():
            self.result_format = "docx"
        else:
            self.result_format = "both"

        self.result_path = self._path_input.text()
        self.result_settings = {
            "page_size": self._page_size.currentText(),
            "header_text": self._header_text.text(),
            "open_after": self._open_after.isChecked(),
        }
        self.accept()
```

- [ ] **Step 2: Verify it imports cleanly**

```bash
python -c "from ui.export_dialog import ExportDialog; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ui/export_dialog.py
git commit -m "feat: add export dialog with format and page options"
```

---

### Task 12: PDF Exporter

**Files:**
- Create: `core/exporter_pdf.py`
- Create: `tests/test_exporter_pdf.py`

- [ ] **Step 1: Write failing tests for PDF export**

```python
import os
import tempfile
import shutil
import pytest
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QPixmap, QColor
from core.project import Project, Section, Step
from core.exporter_pdf import export_to_pdf

app = QApplication.instance() or QApplication([])


class TestPdfExporter:
    def setup_method(self):
        self.temp_dir = tempfile.mkdtemp()
        self.project = Project.create_new("Test Guide", os.path.join(self.temp_dir, "project"))

        # Add a dummy screenshot
        pixmap = QPixmap(800, 600)
        pixmap.fill(QColor("lightblue"))
        img_path = os.path.join(self.project.path, "images", "test.png")
        pixmap.save(img_path, "PNG")
        self.project.sections[0].steps[0].screenshots = ["test.png"]
        self.project.sections[0].steps[0].direction_html = "<p>Click the <b>Save</b> button</p>"
        self.project.save()

    def teardown_method(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_export_creates_pdf(self):
        output_path = os.path.join(self.temp_dir, "output.pdf")
        export_to_pdf(self.project, output_path, page_size="Letter")
        assert os.path.isfile(output_path)
        assert os.path.getsize(output_path) > 0

    def test_export_with_header(self):
        output_path = os.path.join(self.temp_dir, "output_header.pdf")
        export_to_pdf(self.project, output_path, page_size="Letter", header_text="ACME Corp")
        assert os.path.isfile(output_path)

    def test_export_a4(self):
        output_path = os.path.join(self.temp_dir, "output_a4.pdf")
        export_to_pdf(self.project, output_path, page_size="A4")
        assert os.path.isfile(output_path)

    def test_export_multi_section(self):
        self.project.add_section("Advanced")
        step = self.project.sections[1].steps[0]
        step.direction_html = "<p>Configure the settings</p>"
        output_path = os.path.join(self.temp_dir, "output_multi.pdf")
        export_to_pdf(self.project, output_path)
        assert os.path.isfile(output_path)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_exporter_pdf.py -v
```

Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement PDF exporter**

Create `core/exporter_pdf.py`:

```python
import os
from html.parser import HTMLParser
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak,
    Table, TableStyle, KeepTogether,
)
from reportlab.platypus.tableofcontents import TableOfContents
from core.project import Project


PAGE_SIZES = {
    "Letter": letter,
    "A4": A4,
}


class _HTMLStripper(HTMLParser):
    """Strip HTML tags but keep basic formatting for reportlab."""
    def __init__(self):
        super().__init__()
        self._parts = []
        self._tag_stack = []

    def handle_starttag(self, tag, attrs):
        if tag == "b" or tag == "strong":
            self._parts.append("<b>")
            self._tag_stack.append("b")
        elif tag == "i" or tag == "em":
            self._parts.append("<i>")
            self._tag_stack.append("i")
        elif tag == "u":
            self._parts.append("<u>")
            self._tag_stack.append("u")
        elif tag == "br":
            self._parts.append("<br/>")
        elif tag == "li":
            self._parts.append("&bull; ")
        elif tag == "p":
            pass  # handled by data
        else:
            self._tag_stack.append(None)

    def handle_endtag(self, tag):
        if tag in ("b", "strong"):
            self._parts.append("</b>")
        elif tag in ("i", "em"):
            self._parts.append("</i>")
        elif tag == "u":
            self._parts.append("</u>")
        elif tag in ("li", "p"):
            self._parts.append("<br/>")

    def handle_data(self, data):
        self._parts.append(data)

    def get_result(self) -> str:
        return "".join(self._parts).strip()


def _html_to_reportlab(html: str) -> str:
    """Convert HTML from QTextEdit to reportlab-compatible markup."""
    if not html:
        return ""
    stripper = _HTMLStripper()
    stripper.feed(html)
    return stripper.get_result()


def export_to_pdf(
    project: Project,
    output_path: str,
    page_size: str = "Letter",
    header_text: str = "",
    margins: tuple[float, float, float, float] = (0.75, 0.75, 0.75, 0.75),
):
    """Export the project as a PDF file."""
    ps = PAGE_SIZES.get(page_size, letter)
    left, right, top, bottom = [m * inch for m in margins]

    doc = SimpleDocTemplate(
        output_path,
        pagesize=ps,
        leftMargin=left,
        rightMargin=right,
        topMargin=top,
        bottomMargin=bottom,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle", parent=styles["Title"], fontSize=24, spaceAfter=20,
        textColor=HexColor("#333333"),
    )
    section_style = ParagraphStyle(
        "SectionHead", parent=styles["Heading1"], fontSize=18, spaceAfter=12,
        spaceBefore=20, textColor=HexColor("#1565c0"),
    )
    step_style = ParagraphStyle(
        "StepHead", parent=styles["Heading2"], fontSize=14, spaceAfter=8,
        spaceBefore=12, textColor=HexColor("#333333"),
    )
    body_style = ParagraphStyle(
        "StepBody", parent=styles["Normal"], fontSize=11, spaceAfter=10,
        leading=16,
    )
    header_style = ParagraphStyle(
        "Header", parent=styles["Normal"], fontSize=9,
        textColor=HexColor("#888888"), alignment=TA_CENTER,
    )

    story = []

    # Title page
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph(project.name, title_style))
    if header_text:
        story.append(Paragraph(header_text, header_style))
    story.append(PageBreak())

    # Table of Contents header
    story.append(Paragraph("Table of Contents", section_style))
    story.append(Spacer(1, 12))
    for i, section in enumerate(project.sections, 1):
        toc_entry = f"{i}. {section.title}"
        story.append(Paragraph(toc_entry, body_style))
        for j, step in enumerate(section.steps, 1):
            step_entry = f"&nbsp;&nbsp;&nbsp;&nbsp;{i}.{j} {step.title}"
            story.append(Paragraph(step_entry, body_style))
    story.append(PageBreak())

    # Content
    page_width = ps[0] - left - right
    max_img_width = page_width - 20

    for section in project.sections:
        story.append(Paragraph(section.title, section_style))

        for step in section.steps:
            step_content = []
            step_content.append(Paragraph(step.title, step_style))

            # Screenshots
            for screenshot in step.screenshots:
                img_path = os.path.join(project.path, "images", screenshot)
                if os.path.isfile(img_path):
                    try:
                        img = Image(img_path)
                        # Scale to fit page width
                        aspect = img.imageWidth / img.imageHeight
                        img_width = min(max_img_width, img.imageWidth)
                        img_height = img_width / aspect
                        if img_height > 5 * inch:
                            img_height = 5 * inch
                            img_width = img_height * aspect
                        img.drawWidth = img_width
                        img.drawHeight = img_height
                        step_content.append(img)
                        step_content.append(Spacer(1, 8))
                    except Exception:
                        pass

            # Direction text
            if step.direction_html:
                text = _html_to_reportlab(step.direction_html)
                if text:
                    step_content.append(Paragraph(text, body_style))

            step_content.append(Spacer(1, 16))
            story.extend(step_content)

    # Build with page numbers
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(HexColor("#888888"))
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawCentredString(ps[0] / 2, 0.5 * inch, text)
        if header_text:
            canvas.drawCentredString(ps[0] / 2, ps[1] - 0.4 * inch, header_text)
        canvas.restoreState()

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_exporter_pdf.py -v
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/exporter_pdf.py tests/test_exporter_pdf.py
git commit -m "feat: add PDF exporter with TOC and page numbers"
```

---

### Task 13: Word Exporter

**Files:**
- Create: `core/exporter_docx.py`
- Create: `tests/test_exporter_docx.py`

- [ ] **Step 1: Write failing tests for Word export**

```python
import os
import tempfile
import shutil
import pytest
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QPixmap, QColor
from core.project import Project
from core.exporter_docx import export_to_docx

app = QApplication.instance() or QApplication([])


class TestDocxExporter:
    def setup_method(self):
        self.temp_dir = tempfile.mkdtemp()
        self.project = Project.create_new("Test Guide", os.path.join(self.temp_dir, "project"))
        pixmap = QPixmap(800, 600)
        pixmap.fill(QColor("lightblue"))
        img_path = os.path.join(self.project.path, "images", "test.png")
        pixmap.save(img_path, "PNG")
        self.project.sections[0].steps[0].screenshots = ["test.png"]
        self.project.sections[0].steps[0].direction_html = "<p>Click the <b>Save</b> button</p>"
        self.project.save()

    def teardown_method(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_export_creates_docx(self):
        output_path = os.path.join(self.temp_dir, "output.docx")
        export_to_docx(self.project, output_path)
        assert os.path.isfile(output_path)
        assert os.path.getsize(output_path) > 0

    def test_export_with_header(self):
        output_path = os.path.join(self.temp_dir, "output_header.docx")
        export_to_docx(self.project, output_path, header_text="ACME Corp")
        assert os.path.isfile(output_path)

    def test_export_multi_section(self):
        self.project.add_section("Advanced")
        output_path = os.path.join(self.temp_dir, "output_multi.docx")
        export_to_docx(self.project, output_path)
        assert os.path.isfile(output_path)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
python -m pytest tests/test_exporter_docx.py -v
```

Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement Word exporter**

Create `core/exporter_docx.py`:

```python
import os
import re
from html.parser import HTMLParser
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from core.project import Project


class _HTMLToDocxParser(HTMLParser):
    """Parse HTML and add runs to a docx paragraph."""
    def __init__(self, paragraph):
        super().__init__()
        self._paragraph = paragraph
        self._bold = False
        self._italic = False
        self._underline = False
        self._in_list_item = False

    def handle_starttag(self, tag, attrs):
        if tag in ("b", "strong"):
            self._bold = True
        elif tag in ("i", "em"):
            self._italic = True
        elif tag == "u":
            self._underline = True
        elif tag == "li":
            self._in_list_item = True
        elif tag == "br":
            self._paragraph.add_run("\n")

    def handle_endtag(self, tag):
        if tag in ("b", "strong"):
            self._bold = False
        elif tag in ("i", "em"):
            self._italic = False
        elif tag == "u":
            self._underline = False
        elif tag == "li":
            self._in_list_item = False
            self._paragraph.add_run("\n")

    def handle_data(self, data):
        text = data.strip()
        if not text:
            return
        if self._in_list_item:
            text = "  \u2022 " + text
        run = self._paragraph.add_run(text)
        run.bold = self._bold
        run.italic = self._italic
        run.underline = self._underline
        run.font.size = Pt(11)


def _add_html_to_paragraph(paragraph, html: str):
    """Parse HTML and add formatted runs to a paragraph."""
    if not html:
        return
    parser = _HTMLToDocxParser(paragraph)
    parser.feed(html)


def export_to_docx(
    project: Project,
    output_path: str,
    header_text: str = "",
):
    """Export the project as a Word document."""
    doc = Document()

    # Set default font
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    # Header
    if header_text:
        section = doc.sections[0]
        header = section.header
        p = header.paragraphs[0]
        p.text = header_text
        p.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        run = p.runs[0] if p.runs else p.add_run(header_text)
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

    # Title
    title_para = doc.add_heading(project.name, level=0)
    title_para.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

    # Table of Contents placeholder (updates when opened in Word)
    toc_heading = doc.add_heading("Table of Contents", level=1)
    p = doc.add_paragraph()
    run = p.add_run()
    fldChar = _make_toc_field(doc)
    run._element.append(fldChar)
    doc.add_page_break()

    # Content
    page_width_inches = 6.5  # Standard letter minus margins

    for section_obj in project.sections:
        doc.add_heading(section_obj.title, level=1)

        for step in section_obj.steps:
            doc.add_heading(step.title, level=2)

            # Screenshots
            for screenshot in step.screenshots:
                img_path = os.path.join(project.path, "images", screenshot)
                if os.path.isfile(img_path):
                    try:
                        doc.add_picture(img_path, width=Inches(page_width_inches))
                        last_paragraph = doc.paragraphs[-1]
                        last_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
                    except Exception:
                        pass

            # Direction text
            if step.direction_html:
                p = doc.add_paragraph()
                _add_html_to_paragraph(p, step.direction_html)

            doc.add_paragraph()  # spacing

    doc.save(output_path)


def _make_toc_field(doc):
    """Create a TOC field element. Updates when user opens in Word and presses F9."""
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement

    fldChar_begin = OxmlElement("w:fldChar")
    fldChar_begin.set(qn("w:fldCharType"), "begin")

    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = ' TOC \\o "1-2" \\h \\z \\u '

    fldChar_separate = OxmlElement("w:fldChar")
    fldChar_separate.set(qn("w:fldCharType"), "separate")

    fldChar_end = OxmlElement("w:fldChar")
    fldChar_end.set(qn("w:fldCharType"), "end")

    r_element = OxmlElement("w:r")
    r_element.append(fldChar_begin)
    r_element.append(instrText)
    r_element.append(fldChar_separate)
    r_element.append(fldChar_end)

    return r_element
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
python -m pytest tests/test_exporter_docx.py -v
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add core/exporter_docx.py tests/test_exporter_docx.py
git commit -m "feat: add Word exporter with TOC and formatting"
```

---

### Task 14: Main Window (Wiring Everything Together)

**Files:**
- Create: `ui/main_window.py`
- Modify: `main.py`

- [ ] **Step 1: Create the main window**

Create `ui/main_window.py`:

```python
import os
from PyQt6.QtWidgets import (
    QMainWindow, QSplitter, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QFileDialog, QInputDialog, QMessageBox, QStackedWidget,
    QStatusBar, QApplication,
)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QAction, QKeySequence, QPixmap

from ui.sidebar import SidebarNavigator
from ui.toolbar import AnnotationToolbar
from ui.canvas import AnnotationCanvas, ToolMode
from ui.text_editor import DirectionTextEditor
from ui.welcome_screen import WelcomeScreen
from ui.export_dialog import ExportDialog
from ui.capture_overlay import CaptureOverlay
from core.project import Project, Step
from core.screenshot import capture_active_window, save_screenshot
from core.annotations import serialize_annotations, deserialize_annotations
from core.exporter_pdf import export_to_pdf
from core.exporter_docx import export_to_docx


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Instruction Maker")
        self.setMinimumSize(1200, 800)

        self._project: Project | None = None
        self._current_section_id: str | None = None
        self._current_step_id: str | None = None
        self._is_dark_theme = True

        # Stacked widget: welcome vs workspace
        self._stack = QStackedWidget()
        self.setCentralWidget(self._stack)

        # Welcome screen
        self._welcome = WelcomeScreen()
        self._welcome.new_project_requested.connect(self._new_project)
        self._welcome.open_project_requested.connect(self._open_project)
        self._stack.addWidget(self._welcome)

        # Workspace
        self._workspace = QWidget()
        self._setup_workspace()
        self._stack.addWidget(self._workspace)

        # Menu bar
        self._setup_menus()

        # Status bar
        self._status = QStatusBar()
        self.setStatusBar(self._status)
        self._zoom_label = QLabel("100%")
        self._status.addPermanentWidget(self._zoom_label)

        # Auto-save timer
        self._autosave_timer = QTimer(self)
        self._autosave_timer.setInterval(60000)
        self._autosave_timer.timeout.connect(self._autosave)

        # Capture overlay
        self._capture_overlay = CaptureOverlay(seconds=3)
        self._capture_overlay.countdown_finished.connect(self._do_capture)

        # Start on welcome screen
        self._stack.setCurrentWidget(self._welcome)

    def _setup_workspace(self):
        layout = QVBoxLayout(self._workspace)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Toolbar
        self._toolbar = AnnotationToolbar()
        self._toolbar.tool_changed.connect(self._on_tool_changed)
        self._toolbar.color_changed.connect(self._on_color_changed)
        self._toolbar.thickness_changed.connect(self._on_thickness_changed)
        self._toolbar.capture_requested.connect(self._start_capture)
        self._toolbar.undo_requested.connect(lambda: self._canvas.undo())
        self._toolbar.redo_requested.connect(lambda: self._canvas.redo())
        layout.addWidget(self._toolbar)

        # Main splitter: sidebar | canvas+editor
        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Sidebar
        self._sidebar = SidebarNavigator()
        self._sidebar.step_selected.connect(self._on_step_selected)
        self._sidebar.project_modified.connect(self._on_project_modified)
        self._sidebar.setMinimumWidth(200)
        self._sidebar.setMaximumWidth(350)
        splitter.addWidget(self._sidebar)

        # Right panel: canvas + text editor
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(4, 4, 4, 4)
        right_layout.setSpacing(4)

        # Canvas
        self._canvas = AnnotationCanvas()
        self._canvas.zoom_changed.connect(self._on_zoom_changed)
        right_layout.addWidget(self._canvas, stretch=3)

        # Text editor
        self._text_editor = DirectionTextEditor()
        self._text_editor.text_changed.connect(self._on_text_changed)
        right_layout.addWidget(self._text_editor, stretch=1)

        splitter.addWidget(right_panel)
        splitter.setSizes([250, 950])

        layout.addWidget(splitter)

    def _setup_menus(self):
        menubar = self.menuBar()

        # File menu
        file_menu = menubar.addMenu("File")
        new_action = QAction("New Project", self)
        new_action.setShortcut(QKeySequence("Ctrl+N"))
        new_action.triggered.connect(self._new_project)
        file_menu.addAction(new_action)

        open_action = QAction("Open Project", self)
        open_action.setShortcut(QKeySequence("Ctrl+O"))
        open_action.triggered.connect(lambda: self._open_project())
        file_menu.addAction(open_action)

        save_action = QAction("Save", self)
        save_action.setShortcut(QKeySequence("Ctrl+S"))
        save_action.triggered.connect(self._save_project)
        file_menu.addAction(save_action)

        file_menu.addSeparator()

        import_action = QAction("Import Image...", self)
        import_action.triggered.connect(self._import_image)
        file_menu.addAction(import_action)

        file_menu.addSeparator()

        export_action = QAction("Export...", self)
        export_action.setShortcut(QKeySequence("Ctrl+E"))
        export_action.triggered.connect(self._export)
        file_menu.addAction(export_action)

        # Edit menu
        edit_menu = menubar.addMenu("Edit")

        undo_action = QAction("Undo", self)
        undo_action.setShortcut(QKeySequence("Ctrl+Z"))
        undo_action.triggered.connect(lambda: self._canvas.undo())
        edit_menu.addAction(undo_action)

        redo_action = QAction("Redo", self)
        redo_action.setShortcut(QKeySequence("Ctrl+Y"))
        redo_action.triggered.connect(lambda: self._canvas.redo())
        edit_menu.addAction(redo_action)

        edit_menu.addSeparator()

        delete_action = QAction("Delete Selected", self)
        delete_action.setShortcut(QKeySequence("Delete"))
        delete_action.triggered.connect(lambda: self._canvas.delete_selected())
        edit_menu.addAction(delete_action)

        duplicate_action = QAction("Duplicate Step", self)
        duplicate_action.setShortcut(QKeySequence("Ctrl+D"))
        duplicate_action.triggered.connect(self._duplicate_current_step)
        edit_menu.addAction(duplicate_action)

        # View menu
        view_menu = menubar.addMenu("View")
        theme_action = QAction("Toggle Theme", self)
        theme_action.triggered.connect(self._toggle_theme)
        view_menu.addAction(theme_action)

        fit_action = QAction("Fit to Window", self)
        fit_action.setShortcut(QKeySequence("Ctrl+0"))
        fit_action.triggered.connect(self._fit_canvas)
        view_menu.addAction(fit_action)

        # Capture menu
        capture_menu = menubar.addMenu("Capture")
        capture_action = QAction("Capture Active Window", self)
        capture_action.setShortcut(QKeySequence("Ctrl+Shift+C"))
        capture_action.triggered.connect(self._start_capture)
        capture_menu.addAction(capture_action)

        paste_action = QAction("Paste from Clipboard", self)
        paste_action.setShortcut(QKeySequence("Ctrl+V"))
        paste_action.triggered.connect(self._paste_from_clipboard)
        capture_menu.addAction(paste_action)

    def _new_project(self):
        name, ok = QInputDialog.getText(self, "New Project", "Project name:")
        if not ok or not name:
            return
        path = QFileDialog.getExistingDirectory(self, "Choose project folder")
        if not path:
            return
        project_path = os.path.join(path, name.replace(" ", "_"))
        self._project = Project.create_new(name, project_path)
        WelcomeScreen.add_to_recent(name, project_path)
        self._load_project_ui()

    def _open_project(self, path: str = ""):
        if not path:
            path = QFileDialog.getExistingDirectory(self, "Open Project Folder")
        if not path or not os.path.isfile(os.path.join(path, "project.json")):
            if path:
                QMessageBox.warning(self, "Error", "No project.json found in that folder.")
            return
        self._project = Project.load(path)
        WelcomeScreen.add_to_recent(self._project.name, path)
        self._load_project_ui()

    def _load_project_ui(self):
        self.setWindowTitle(f"Instruction Maker - {self._project.name}")
        self._sidebar.set_project(self._project)
        self._stack.setCurrentWidget(self._workspace)
        self._autosave_timer.start()

    def _save_project(self):
        if self._project:
            self._save_current_step()
            self._project.save()
            self._status.showMessage("Project saved.", 3000)

    def _autosave(self):
        if self._project:
            self._save_current_step()
            self._project.save()

    def _save_current_step(self):
        """Save the current step's annotations and text back to the data model."""
        if not self._project or not self._current_section_id or not self._current_step_id:
            return
        section = self._project.get_section(self._current_section_id)
        if not section:
            return
        for step in section.steps:
            if step.step_id == self._current_step_id:
                # Save direction text
                step.direction_html = self._text_editor.get_html()
                # Save annotations
                ann_data = self._canvas.extract_annotation_data()
                step.annotations = [a.to_dict() for a in ann_data]
                break

    def _on_step_selected(self, section_id: str, step_id: str):
        # Save current step first
        self._save_current_step()

        self._current_section_id = section_id
        self._current_step_id = step_id

        section = self._project.get_section(section_id)
        if not section:
            return

        for step in section.steps:
            if step.step_id == step_id:
                # Load screenshot
                self._canvas.clear_annotations()
                if step.screenshots:
                    img_path = os.path.join(self._project.path, "images", step.screenshots[0])
                    if os.path.isfile(img_path):
                        self._canvas.set_screenshot(QPixmap(img_path))

                # Load annotations
                if step.annotations:
                    from core.annotations import deserialize_annotations
                    import json
                    ann_json = json.dumps(step.annotations)
                    ann_list = deserialize_annotations(ann_json)
                    self._canvas.load_annotations_from_data(ann_list)

                # Load text
                self._text_editor.set_html(step.direction_html or "")
                break

    def _on_project_modified(self):
        if self._project:
            self._project.save()

    def _on_tool_changed(self, mode: str):
        self._canvas.set_tool(mode)

    def _on_color_changed(self, color: str):
        self._canvas.set_color(color)

    def _on_thickness_changed(self, thickness: int):
        self._canvas.set_thickness(thickness)

    def _on_zoom_changed(self, level: float):
        self._zoom_label.setText(f"{int(level * 100)}%")

    def _on_text_changed(self):
        pass  # Will be saved on step change or save

    def _start_capture(self):
        if not self._project:
            return
        countdown = self._project.settings.get("countdown_seconds", 3)
        self._capture_overlay._seconds = countdown
        self._capture_overlay.start()

    def _do_capture(self):
        if not self._project or not self._current_section_id or not self._current_step_id:
            return

        pixmap = capture_active_window()
        if pixmap.isNull():
            return

        # Save to project images
        images_dir = os.path.join(self._project.path, "images")
        filepath = save_screenshot(pixmap, images_dir, "capture")
        filename = os.path.basename(filepath)

        # Update step data
        section = self._project.get_section(self._current_section_id)
        if section:
            for step in section.steps:
                if step.step_id == self._current_step_id:
                    step.screenshots = [filename]
                    break

        # Show on canvas
        self._canvas.clear_annotations()
        self._canvas.set_screenshot(pixmap)
        self._status.showMessage(f"Screenshot captured: {filename}", 3000)

    def _paste_from_clipboard(self):
        clipboard = QApplication.clipboard()
        pixmap = clipboard.pixmap()
        if pixmap and not pixmap.isNull():
            if self._project and self._current_step_id:
                images_dir = os.path.join(self._project.path, "images")
                filepath = save_screenshot(pixmap, images_dir, "paste")
                filename = os.path.basename(filepath)

                section = self._project.get_section(self._current_section_id)
                if section:
                    for step in section.steps:
                        if step.step_id == self._current_step_id:
                            step.screenshots = [filename]
                            break

                self._canvas.set_screenshot(pixmap)
                self._status.showMessage("Image pasted from clipboard.", 3000)

    def _import_image(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Import Image", "", "Images (*.png *.jpg *.jpeg *.bmp)"
        )
        if path and self._project and self._current_step_id:
            pixmap = QPixmap(path)
            if not pixmap.isNull():
                images_dir = os.path.join(self._project.path, "images")
                filepath = save_screenshot(pixmap, images_dir, "import")
                filename = os.path.basename(filepath)

                section = self._project.get_section(self._current_section_id)
                if section:
                    for step in section.steps:
                        if step.step_id == self._current_step_id:
                            step.screenshots = [filename]
                            break

                self._canvas.set_screenshot(pixmap)

    def _export(self):
        if not self._project:
            return
        self._save_current_step()
        self._project.save()

        dialog = ExportDialog(self._project.name, self)
        if dialog.exec():
            fmt = dialog.result_format
            path = dialog.result_path
            settings = dialog.result_settings
            base_name = self._project.name.replace(" ", "_")

            try:
                if fmt in ("pdf", "both"):
                    pdf_path = os.path.join(path, f"{base_name}.pdf")
                    export_to_pdf(
                        self._project, pdf_path,
                        page_size=settings.get("page_size", "Letter"),
                        header_text=settings.get("header_text", ""),
                    )

                if fmt in ("docx", "both"):
                    docx_path = os.path.join(path, f"{base_name}.docx")
                    export_to_docx(
                        self._project, docx_path,
                        header_text=settings.get("header_text", ""),
                    )

                self._status.showMessage("Export complete!", 5000)

                if settings.get("open_after"):
                    if fmt == "pdf":
                        os.startfile(pdf_path)
                    elif fmt == "docx":
                        os.startfile(docx_path)
                    else:
                        os.startfile(pdf_path)

            except Exception as e:
                QMessageBox.critical(self, "Export Error", str(e))

    def _duplicate_current_step(self):
        if self._project and self._current_section_id and self._current_step_id:
            self._save_current_step()
            self._project.duplicate_step(self._current_section_id, self._current_step_id)
            self._sidebar.refresh_tree()
            self._project.save()

    def _toggle_theme(self):
        self._is_dark_theme = not self._is_dark_theme
        theme = "dark" if self._is_dark_theme else "light"
        theme_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                   "assets", "themes", f"{theme}.qss")
        if os.path.exists(theme_path):
            with open(theme_path, "r") as f:
                QApplication.instance().setStyleSheet(f.read())
        if self._project:
            self._project.settings["theme"] = theme

    def _fit_canvas(self):
        if self._canvas._screenshot_item:
            self._canvas.fitInView(
                self._canvas._screenshot_item,
                Qt.AspectRatioMode.KeepAspectRatio
            )

    def keyPressEvent(self, event):
        # Number keys 1-8 to select tools
        key = event.key()
        if Qt.Key.Key_1 <= key <= Qt.Key.Key_8:
            num = key - Qt.Key.Key_1 + 1
            self._toolbar.select_tool_by_key(num)
            return
        super().keyPressEvent(event)
```

- [ ] **Step 2: Update `main.py` to use MainWindow**

Replace the content of `main.py`:

```python
import sys
import os
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Instruction Maker")
    app.setOrganizationName("InstructionMaker")

    # Load dark theme by default
    theme_path = os.path.join(os.path.dirname(__file__), "assets", "themes", "dark.qss")
    if os.path.exists(theme_path):
        with open(theme_path, "r") as f:
            app.setStyleSheet(f.read())

    from ui.main_window import MainWindow
    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Verify app launches**

```bash
python main.py
```

Expected: The app opens with the welcome screen. Click "New Project", choose a name and folder. The workspace appears with sidebar, toolbar, canvas, and text editor. Close to exit.

- [ ] **Step 4: Commit**

```bash
git add ui/main_window.py main.py
git commit -m "feat: wire up main window with all components"
```

---

### Task 15: Integration Testing & Polish

**Files:**
- Modify: Various files for fixes found during integration testing

- [ ] **Step 1: Run all unit tests**

```bash
python -m pytest tests/ -v
```

Expected: All tests pass.

- [ ] **Step 2: Manual integration test checklist**

Run the app and test each feature:

```bash
python main.py
```

Test the following:
1. Create a new project from welcome screen
2. Capture a screenshot (Ctrl+Shift+C with countdown)
3. Draw a circle annotation on the screenshot
4. Draw a rectangle annotation
5. Draw an arrow
6. Place numbered step markers (1, 2, 3)
7. Add a text label
8. Use the highlighter
9. Use the blur/redact tool
10. Change annotation colors
11. Change line thickness
12. Undo/Redo annotations
13. Delete a selected annotation
14. Type direction text with bold and italic formatting
15. Insert a template and fill placeholders
16. Add a new section and new steps via sidebar
17. Rename a section and step
18. Duplicate a step
19. Delete a step
20. Switch between steps (verify data loads/saves)
21. Export to PDF — verify file opens with screenshots and text
22. Export to Word — verify file opens with screenshots and text
23. Toggle theme (dark/light)
24. Paste image from clipboard (Ctrl+V)
25. Import an image from file
26. Save and reopen the project

- [ ] **Step 3: Fix any issues found during integration testing**

Address any bugs discovered during manual testing.

- [ ] **Step 4: Commit final fixes**

```bash
git add -A
git commit -m "fix: integration testing fixes and polish"
```

---
