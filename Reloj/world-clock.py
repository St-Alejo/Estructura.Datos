import tkinter as tk
from tkinter import ttk, font as tkfont
import math
from datetime import datetime, timedelta
import pytz
import winsound
import threading
import time

class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class CircularDoublyLinkedList:
    def __init__(self):
        self.head = None
    
    def insert(self, value):
        new_node = Node(value)
        if not self.head:
            new_node.next = new_node
            new_node.prev = new_node
            self.head = new_node
        else:
            last = self.head.prev
            new_node.next = self.head
            new_node.prev = last
            last.next = new_node
            self.head.prev = new_node
    
    def traverse(self):
        nodes = []
        current = self.head
        if current:
            while True:
                nodes.append(current.value)
                current = current.next
                if current == self.head:
                    break
        return nodes

class WorldClock:
    def __init__(self, root):
        self.root = root
        self.root.title("World Clock")
        self.root.geometry("1000x800")
        
        self.dark_mode = True
        self.setup_theme()
        
        self.hours = CircularDoublyLinkedList()
        for h in range(1, 13): self.hours.insert(h)
        
        self.minutes = CircularDoublyLinkedList()
        for m in range(0, 60): self.minutes.insert(m)
        
        self.seconds = CircularDoublyLinkedList()
        for s in range(0, 60): self.seconds.insert(s)
        
        self.time_offset = 0
        self.time_zones = [
            'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 
            'Europe/Madrid', 'Europe/Rome', 'America/New_York', 
            'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'America/Bogota', 'America/Mexico_City', 'America/Santiago',
            'America/Argentina/Buenos_Aires', 'Asia/Tokyo', 'Asia/Shanghai',
            'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 
            'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
            'Africa/Cairo', 'Africa/Johannesburg', 'Asia/Kolkata',
            'Asia/Bangkok', 'Asia/Seoul', 'America/Toronto',
            'America/Vancouver', 'Asia/Taipei', 'Asia/Manila'
        ]
        self.current_zone = 'America/Bogota'
        self.sound_enabled = False
        self.sound_thread = None
        
        try:
            self.font_title = tkfont.Font(family="Helvetica", size=24, weight="bold")
            self.font_digital = tkfont.Font(family="Helvetica", size=36, weight="bold")
            self.font_clock = tkfont.Font(family="Helvetica", size=18, weight="bold")
            self.font_text = tkfont.Font(family="Helvetica", size=12)
        except:
            self.font_title = tkfont.Font(family="Helvetica", size=24, weight="bold")
            self.font_digital = tkfont.Font(family="Helvetica", size=36, weight="bold")
            self.font_clock = tkfont.Font(family="Courier", size=18, weight="bold")
            self.font_text = tkfont.Font(family="Helvetica", size=12)
        
        self.setup_ui()
        self.draw_clock()
        self.update_clock()
    
    def setup_theme(self):
        if self.dark_mode:
            self.bg_color = '#0F0F1F'
            self.panel_color = '#1A1A2F'
            self.clock_bg = '#1E1E3A'
            self.clock_ring = '#3A3A5A'
            self.hour_hand = '#FF6B8B'
            self.minute_hand = '#00D4CC'
            self.second_hand = '#FFE66D'
            self.text_color = '#F0F0FF'
            self.highlight = '#FF6B8B'
            self.button_bg = '#00D4CC'
            self.button_text = '#0F0F1F'
            self.markers = '#4A4A6A'
        else:
            self.bg_color = '#F5F5F5'
            self.panel_color = '#E0E0E0'
            self.clock_bg = '#FFFFFF'
            self.clock_ring = '#CCCCCC'
            self.hour_hand = '#FF4D79'
            self.minute_hand = '#00B4A0'
            self.second_hand = '#FFD700'
            self.text_color = '#333333'
            self.highlight = '#FF4D79'
            self.button_bg = '#00B4A0'
            self.button_text = '#FFFFFF'
            self.markers = '#999999'
    
    def setup_ui(self):
        self.main_frame = tk.Frame(self.root, bg=self.bg_color)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        self.clock_frame = tk.Frame(
            self.main_frame,
            bg=self.clock_bg,
            bd=0,
            highlightthickness=2,
            highlightbackground=self.clock_ring
        )
        self.clock_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        
        self.canvas = tk.Canvas(
            self.clock_frame,
            width=500,
            height=500,
            bg=self.clock_bg,
            highlightthickness=0
        )
        self.canvas.pack(padx=20, pady=20)
        
        self.control_frame = tk.Frame(
            self.main_frame,
            bg=self.panel_color,
            bd=0,
            highlightthickness=1,
            highlightbackground=self.clock_ring
        )
        self.control_frame.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")
        
        self.title_label = tk.Label(
            self.control_frame,
            text="WORLD CLOCK",
            font=self.font_title,
            bg=self.panel_color,
            fg=self.highlight,
            pady=20
        )
        self.title_label.pack(fill=tk.X)
        
        self.theme_btn = tk.Button(
            self.control_frame,
            text="☀️ LIGHT MODE" if self.dark_mode else "🌙 DARK MODE",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color,
            bd=1,
            padx=20,
            pady=5,
            highlightbackground=self.clock_ring,
            command=self.toggle_theme
        )
        self.theme_btn.pack(pady=(0, 20))
        
        self.tz_label = tk.Label(
            self.control_frame,
            text="Time Zone:",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color
        )
        self.tz_label.pack(pady=(10, 5))
        
        self.tz_combo = ttk.Combobox(
            self.control_frame,
            values=self.time_zones,
            font=self.font_text,
            state="readonly"
        )
        self.tz_combo.set(self.current_zone)
        self.tz_combo.pack(pady=5, ipadx=10, ipady=5)
        self.tz_combo.bind("<<ComboboxSelected>>", self.change_timezone)
        
        self.adj_label = tk.Label(
            self.control_frame,
            text="Manual Adjustment (hours):",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color
        )
        self.adj_label.pack(pady=(15, 5))
        
        self.adj_spin = ttk.Spinbox(
            self.control_frame,
            from_=-12,
            to=12,
            font=self.font_text
        )
        self.adj_spin.set(0)
        self.adj_spin.pack(pady=5, ipadx=10, ipady=5)
        
        self.button_frame = tk.Frame(self.control_frame, bg=self.panel_color)
        self.button_frame.pack(pady=20)
        
        self.apply_btn = tk.Button(
            self.button_frame,
            text="APPLY",
            font=self.font_text,
            bg=self.button_bg,
            fg=self.button_text,
            bd=0,
            padx=20,
            pady=8,
            command=self.apply_adjustment
        )
        self.apply_btn.pack(side=tk.LEFT, padx=10)
        
        self.reset_btn = tk.Button(
            self.button_frame,
            text="RESET",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color,
            bd=1,
            padx=20,
            pady=8,
            highlightbackground=self.clock_ring,
            command=self.reset_clock
        )
        self.reset_btn.pack(side=tk.LEFT, padx=10)
        
        self.sound_btn = tk.Button(
            self.control_frame,
            text="🔈 ENABLE TICKING",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color,
            bd=1,
            padx=20,
            pady=10,
            highlightbackground=self.clock_ring,
            command=self.toggle_sound
        )
        self.sound_btn.pack(pady=20)
        
        self.time_label = tk.Label(
            self.control_frame,
            text="21:45:30",
            font=self.font_digital,
            bg=self.panel_color,
            fg=self.highlight
        )
        self.time_label.pack(pady=(20, 5))
        
        self.date_label = tk.Label(
            self.control_frame,
            text="Monday, 07 April 2025",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color
        )
        self.date_label.pack(pady=(0, 20))
        
        self.other_zones_label = tk.Label(
            self.control_frame,
            text="OTHER TIME ZONES:",
            font=self.font_text,
            bg=self.panel_color,
            fg=self.text_color
        )
        self.other_zones_label.pack(pady=(10, 5))
        
        self.other_zones_text = tk.Text(
            self.control_frame,
            height=10,
            width=30,
            bg=self.clock_bg,
            fg=self.text_color,
            font=self.font_text,
            relief=tk.FLAT,
            padx=10,
            pady=10,
            highlightthickness=0,
            borderwidth=0
        )
        self.other_zones_text.pack(pady=5)
        
        self.main_frame.grid_rowconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(1, weight=1)
    
    def toggle_theme(self):
        self.dark_mode = not self.dark_mode
        self.setup_theme()
        self.update_ui_colors()
        self.draw_clock()
    
    def update_ui_colors(self):
        self.root.configure(bg=self.bg_color)
        self.main_frame.configure(bg=self.bg_color)
        self.clock_frame.configure(bg=self.clock_bg, highlightbackground=self.clock_ring)
        self.control_frame.configure(bg=self.panel_color, highlightbackground=self.clock_ring)
        self.canvas.configure(bg=self.clock_bg)
        self.title_label.configure(bg=self.panel_color, fg=self.highlight)
        self.theme_btn.configure(
            text="☀️ LIGHT MODE" if self.dark_mode else "🌙 DARK MODE",
            bg=self.panel_color,
            fg=self.text_color,
            highlightbackground=self.clock_ring
        )
        self.tz_label.configure(bg=self.panel_color, fg=self.text_color)
        self.adj_label.configure(bg=self.panel_color, fg=self.text_color)
        self.button_frame.configure(bg=self.panel_color)
        self.apply_btn.configure(bg=self.button_bg, fg=self.button_text)
        self.reset_btn.configure(bg=self.panel_color, fg=self.text_color, highlightbackground=self.clock_ring)
        self.sound_btn.configure(bg=self.panel_color, fg=self.text_color, highlightbackground=self.clock_ring)
        self.time_label.configure(bg=self.panel_color, fg=self.highlight)
        self.date_label.configure(bg=self.panel_color, fg=self.text_color)
        self.other_zones_label.configure(bg=self.panel_color, fg=self.text_color)
        self.other_zones_text.configure(bg=self.clock_bg, fg=self.text_color)
    
    def draw_clock(self):
        self.canvas.delete("all")
        self.canvas.create_oval(
            50, 50, 450, 450,
            outline=self.clock_ring,
            width=4,
            fill=self.clock_bg
        )
        
        for hour in self.hours.traverse():
            angle = math.radians(hour * 30 - 90)
            x = 250 + 180 * math.cos(angle)
            y = 250 + 180 * math.sin(angle)
            self.canvas.create_text(
                x, y,
                text=str(hour),
                font=self.font_clock,
                fill=self.text_color
            )
        
        for minute in range(0, 60, 10):
            angle = math.radians(minute * 6 - 90)
            x = 250 + 210 * math.cos(angle)
            y = 250 + 210 * math.sin(angle)
            self.canvas.create_text(
                x, y,
                text=f"{minute:02d}",
                font=self.font_text,
                fill=self.text_color
            )
    
    def play_tick_sound(self):
        while self.sound_enabled:
            winsound.Beep(1200, 80)
            time.sleep(0.95)
    
    def toggle_sound(self):
        self.sound_enabled = not self.sound_enabled
        if self.sound_enabled:
            self.sound_btn.config(text="🔇 DISABLE TICKING", fg=self.highlight)
            self.sound_thread = threading.Thread(target=self.play_tick_sound, daemon=True)
            self.sound_thread.start()
        else:
            self.sound_btn.config(text="🔈 ENABLE TICKING", fg=self.text_color)
    
    def get_current_time(self):
        utc_time = datetime.now(pytz.utc)
        try:
            tz = pytz.timezone(self.current_zone)
            local_time = utc_time.astimezone(tz)
        except:
            local_time = utc_time + timedelta(hours=self.time_offset)
        return local_time + timedelta(hours=self.time_offset)
    
    def update_clock(self):
        current_time = self.get_current_time()
        self.canvas.delete("hands")
        
        smooth_seconds = current_time.second + current_time.microsecond / 1000000
        smooth_minutes = current_time.minute + smooth_seconds / 60
        smooth_hours = current_time.hour % 12 + smooth_minutes / 60
        
        hour_angle = math.radians(smooth_hours * 30 - 90)
        minute_angle = math.radians(smooth_minutes * 6 - 90)
        second_angle = math.radians(smooth_seconds * 6 - 90)
        
        hour_x = 250 + 100 * math.cos(hour_angle)
        hour_y = 250 + 100 * math.sin(hour_angle)
        self.canvas.create_line(
            250, 250, hour_x, hour_y,
            width=8,
            fill=self.hour_hand,
            capstyle=tk.ROUND,
            tags="hands"
        )
        
        minute_x = 250 + 150 * math.cos(minute_angle)
        minute_y = 250 + 150 * math.sin(minute_angle)
        self.canvas.create_line(
            250, 250, minute_x, minute_y,
            width=5,
            fill=self.minute_hand,
            capstyle=tk.ROUND,
            tags="hands"
        )
        
        second_x = 250 + 190 * math.cos(second_angle)
        second_y = 250 + 190 * math.sin(second_angle)
        self.canvas.create_line(
            250, 250, second_x, second_y,
            width=2,
            fill=self.second_hand,
            tags="hands"
        )
        
        self.canvas.create_oval(
            245, 245, 255, 255,
            fill=self.second_hand,
            outline="",
            tags="hands"
        )
        
        time_str = current_time.strftime("%H:%M:%S")
        date_str = current_time.strftime("%A, %d %B %Y")
        self.time_label.config(text=time_str)
        self.date_label.config(text=date_str)
        
        zones_text = ""
        for zone in self.time_zones:
            if zone != self.current_zone:
                try:
                    tz = pytz.timezone(zone)
                    zone_time = current_time.astimezone(tz)
                    zone_name = zone.split('/')[-1].replace('_', ' ')
                    zones_text += f"{zone_name}: {zone_time.strftime('%H:%M')}\n"
                except:
                    pass
        
        self.other_zones_text.config(state=tk.NORMAL)
        self.other_zones_text.delete(1.0, tk.END)
        self.other_zones_text.insert(tk.END, zones_text)
        self.other_zones_text.config(state=tk.DISABLED)
        
        self.root.after(50, self.update_clock)
    
    def change_timezone(self, event=None):
        self.current_zone = self.tz_combo.get()
        self.time_offset = 0
        self.adj_spin.delete(0, tk.END)
        self.adj_spin.insert(0, "0")
    
    def apply_adjustment(self):
        try:
            self.time_offset = int(self.adj_spin.get())
            self.current_zone = "Manual"
            self.tz_combo.set("Manual")
        except ValueError:
            pass
    
    def reset_clock(self):
        self.current_zone = 'America/Bogota'
        self.time_offset = 0
        self.tz_combo.set(self.current_zone)
        self.adj_spin.delete(0, tk.END)
        self.adj_spin.insert(0, "0")

if __name__ == "__main__":
    root = tk.Tk()
    app = WorldClock(root)
    root.mainloop()