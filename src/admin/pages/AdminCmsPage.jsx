import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { cmsApi } from '../../api/cms';
import {
  LayoutList,
  Sliders,
  Sparkles,
  Palette,
  Megaphone,
  Compass,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

const CMS_TABS = [
  { id: 'sections', label: 'Homepage Sections', icon: LayoutList },
  { id: 'hero', label: 'Hero Studio', icon: Sparkles },
  { id: 'theme', label: 'Design System & Presets', icon: Palette },
  { id: 'announcement', label: 'Announcement & Offers', icon: Megaphone },
  { id: 'editorial', label: 'Editorial Statements', icon: Sliders },
  { id: 'navigation', label: 'Navigation & Footer', icon: Compass },
];

export default function AdminCmsPage() {
  const { accessToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('sections');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({
    theme_appearance: null,
    announcement_bar: null,
    mega_menu_nav: null,
    footer_settings: null,
    brand_contacts: null,
  });

  const loadCmsData = async () => {
    setLoading(true);
    try {
      const [secRes, setRes] = await Promise.all([
        cmsApi.getSections(accessToken),
        cmsApi.getSettings(accessToken),
      ]);

      if (secRes?.success) {
        setSections(secRes.data.sections || []);
      }
      if (setRes?.success) {
        const map = {};
        (setRes.data.settings || []).forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      setMessage({ type: 'error', text: 'Failed to load CMS data: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, [accessToken]);

  const showBanner = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Section Handlers
  const handleToggleSection = async (sec) => {
    try {
      const updated = !sec.isEnabled;
      await cmsApi.updateSection(sec.id, { isEnabled: updated }, accessToken);
      setSections((prev) => prev.map((s) => (s.id === sec.id ? { ...s, isEnabled: updated } : s)));
      showBanner('success', `Section "${sec.title || sec.type}" is now ${updated ? 'active' : 'hidden'}.`);
    } catch (err) {
      showBanner('error', 'Error updating section visibility: ' + err.message);
    }
  };

  const handleMoveSection = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    setSections(reordered);

    try {
      const ids = reordered.map((s) => s.id);
      await cmsApi.reorderSections(ids, accessToken);
      showBanner('success', 'Section order saved.');
    } catch (err) {
      showBanner('error', 'Failed to save section order: ' + err.message);
      loadCmsData();
    }
  };

  const handleUpdateSectionData = async (secId, partialData) => {
    try {
      setSaving(true);
      await cmsApi.updateSection(secId, partialData, accessToken);
      setSections((prev) =>
        prev.map((s) => (s.id === secId ? { ...s, ...partialData } : s))
      );
      showBanner('success', 'Section settings updated.');
    } catch (err) {
      showBanner('error', 'Failed to update section: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Setting Handlers
  const handleSaveSetting = async (key, value) => {
    try {
      setSaving(true);
      await cmsApi.updateSetting(key, value, accessToken);
      setSettings((prev) => ({ ...prev, [key]: value }));
      showBanner('success', `Setting "${key}" updated successfully.`);
    } catch (err) {
      showBanner('error', 'Failed to save setting: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Reset CMS sections and theme settings to official İLLURÊ luxury defaults?')) return;
    try {
      setLoading(true);
      await cmsApi.seedDefaults(accessToken);
      await loadCmsData();
      showBanner('success', 'CMS settings reset to official İLLURÊ standards.');
    } catch (err) {
      showBanner('error', 'Reset failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get or edit hero config
  const heroSection = sections.find((s) => s.type === 'hero');
  const heroContent = heroSection?.content || {};

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-[#13191B]">
        <div className="w-8 h-8 border-2 border-[#B89A62] border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-sm tracking-widest text-[#B89A62]">Loading İLLURÊ Visual Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-[#0D1112] text-[#F2EFE8] p-6 sm:p-8 rounded-2xl border border-[#B89A62]/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B89A62]/15 text-[#B89A62] text-[10px] tracking-widest uppercase rounded-full border border-[#B89A62]/30 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Storefront Content &amp; Visual Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide mt-2">
            İLLURÊ Brand Studio &amp; CMS
          </h1>
          <p className="text-xs text-[#F2EFE8]/70 mt-1 max-w-2xl font-light">
            Control the luxury editorial storefront in real time. Customize the cinematic hero, reorder narrative sections, adjust the obsidian gold palette, and curate brand messaging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#B89A62]/40 text-[#B89A62] hover:bg-[#B89A62]/10 text-xs font-medium transition-colors"
            title="Reset to Luxury Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B89A62] text-[#080C0D] hover:bg-[#C0A46D] text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-950/40 text-red-300 border border-red-500/30'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex overflow-x-auto border-b border-gray-200 gap-2 pb-px font-sans text-xs">
        {CMS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium tracking-wide whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#B89A62] text-[#0D1112] font-semibold bg-white rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#B89A62]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEPAGE SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Homepage Narrative Architecture</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle display states, reorganize vertical visual hierarchy, and switch editorial layout modes.
              </p>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {sections.filter((s) => s.isEnabled).length} / {sections.length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-4 rounded-xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  sec.isEnabled ? 'border-gray-200 shadow-sm' : 'border-gray-100 bg-gray-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-gray-400 w-6 text-center">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 font-sans">
                        {sec.title || sec.type.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {sec.type}
                      </span>
                      {sec.layoutVariant && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#B89A62]/10 text-[#8C6D32] border border-[#B89A62]/20">
                          {sec.layoutVariant}
                        </span>
                      )}
                    </div>
                    {sec.subtitle && (
                      <p className="text-[11px] text-gray-500 mt-0.5 italic">{sec.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Layout Variant Switcher for Sections that support it */}
                  {['featured_fragrances', 'bestsellers', 'collections'].includes(sec.type) && (
                    <select
                      value={sec.layoutVariant || 'EDITORIAL'}
                      onChange={(e) =>
                        handleUpdateSectionData(sec.id, { layoutVariant: e.target.value })
                      }
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:border-[#B89A62]"
                    >
                      <option value="EDITORIAL">Editorial Showcase</option>
                      <option value="GRID">Geometric Grid</option>
                      <option value="CAROUSEL">Horizontal Carousel</option>
                    </select>
                  )}

                  {/* Move Up */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, -1)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMoveSection(idx, 1)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => handleToggleSection(sec)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sec.isEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {sec.isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HERO STUDIO */}
      {activeTab === 'hero' && heroSection && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-serif text-[#0D1112]">Cinematic Hero Section Configuration</h2>
            <p className="text-xs text-gray-500 mt-1">
              Customize the full-bleed visual landing experience, bottle artwork, editorial typography, and action buttons.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const content = {
                ...heroContent,
                eyebrow: formData.get('eyebrow'),
                heading: formData.get('heading'),
                subheading: formData.get('subheading'),
                primaryCtaText: formData.get('primaryCtaText'),
                primaryCtaLink: formData.get('primaryCtaLink'),
                secondaryCtaText: formData.get('secondaryCtaText'),
                secondaryCtaLink: formData.get('secondaryCtaLink'),
                bottleImage: formData.get('bottleImage'),
                backgroundImage: formData.get('backgroundImage'),
                overlayStrength: parseFloat(formData.get('overlayStrength') || '0.65'),
                alignment: formData.get('alignment'),
              };
              handleUpdateSectionData(heroSection.id, {
                title: formData.get('heading'),
                subtitle: formData.get('subheading'),
                content,
              });
            }}
            className="space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eyebrow */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  name="eyebrow"
                  defaultValue={heroContent.eyebrow || 'THE HOUSE OF İLLURÊ'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Text Alignment */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Visual Alignment
                </label>
                <select
                  name="alignment"
                  defaultValue={heroContent.alignment || 'left'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62] bg-white"
                >
                  <option value="left">Left Aligned Editorial</option>
                  <option value="center">Centered Grand Campaign</option>
                </select>
              </div>

              {/* Heading */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Hero Headline (Serif Luxury)
                </label>
                <input
                  type="text"
                  name="heading"
                  defaultValue={heroContent.heading || 'Fragrance, Reimagined.'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62] font-serif text-sm"
                />
              </div>

              {/* Subheading */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Narrative Subtitle / Body Copy
                </label>
                <textarea
                  name="subheading"
                  rows={3}
                  defaultValue={
                    heroContent.subheading ||
                    'Distinctive scent profiles inspired by icons, finished in the language of İLLURÊ.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Bottle Image */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Featured Flacon Image URL
                </label>
                <input
                  type="text"
                  name="bottleImage"
                  defaultValue={heroContent.bottleImage || '/images/oud_wood.jpg'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62] font-mono text-[11px]"
                />
                <p className="text-[10px] text-gray-400">Default: /images/oud_wood.jpg</p>
              </div>

              {/* Background Media */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Background Image URL (Optional)
                </label>
                <input
                  type="text"
                  name="backgroundImage"
                  defaultValue={heroContent.backgroundImage || ''}
                  placeholder="Leave empty for cosmic obsidian ambient canvas"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62] font-mono text-[11px]"
                />
              </div>

              {/* Primary CTA */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  name="primaryCtaText"
                  defaultValue={heroContent.primaryCtaText || 'EXPLORE THE COLLECTION'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Primary Link */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Primary Button Link / Action
                </label>
                <input
                  type="text"
                  name="primaryCtaLink"
                  defaultValue={heroContent.primaryCtaLink || '#curated-section'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Secondary CTA */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  name="secondaryCtaText"
                  defaultValue={heroContent.secondaryCtaText || 'DISCOVER İLLURÊ'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Secondary Link */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  name="secondaryCtaLink"
                  defaultValue={heroContent.secondaryCtaLink || '#brand-story'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Overlay Strength */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Cinematic Vignette Darkness (0.1 to 0.95)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.95"
                  name="overlayStrength"
                  defaultValue={heroContent.overlayStrength ?? 0.65}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0D1112] text-[#F2EFE8] hover:bg-[#B89A62] hover:text-[#080C0D] transition-all font-semibold tracking-wider uppercase text-xs cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish Hero Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DESIGN SYSTEM & PRESETS */}
      {activeTab === 'theme' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
          <div>
            <h2 className="text-lg font-serif text-[#0D1112]">Centralized Luxury Design System</h2>
            <p className="text-xs text-gray-500 mt-1">
              Select curated visual presets, customize the antique gold hue, control negative space, and configure corner geometry.
            </p>
          </div>

          {/* Presets */}
          <div className="space-y-3">
            <label className="font-semibold text-gray-700 uppercase tracking-wider text-xs">
              Brand Atmosphere Presets
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'ILLURE_OBSIDIAN',
                  name: 'İLLURÊ OBSIDIAN',
                  desc: 'Deep charcoal near-black backdrop with antique muted gold accents. The signature house identity.',
                  bg: '#080C0D',
                  accent: '#B89A62',
                },
                {
                  id: 'ILLURE_IVORY',
                  name: 'İLLURÊ IVORY EDITORIAL',
                  desc: 'Warm cream ivory daylight studio mode. Perfect for seasonal daytime campaigns.',
                  bg: '#F7F4EE',
                  accent: '#A98B55',
                },
                {
                  id: 'CAMPAIGN_DARK',
                  name: 'CAMPAIGN CINEMATIC DARK',
                  desc: 'Ultra deep obsidian noir with high-contrast burnished gold highlighting.',
                  bg: '#050708',
                  accent: '#C0A46D',
                },
              ].map((preset) => {
                const currentPreset = settings.theme_appearance?.preset || 'ILLURE_OBSIDIAN';
                const isSelected = currentPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      const updated = {
                        ...(settings.theme_appearance || {}),
                        preset: preset.id,
                        colorBgPrimary: preset.bg,
                        colorGold: preset.accent,
                      };
                      handleSaveSetting('theme_appearance', updated);
                    }}
                    className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#B89A62] bg-[#0D1112] text-white shadow-lg ring-1 ring-[#B89A62]'
                        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-bold text-xs tracking-wider">
                          {preset.name}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="font-mono">{preset.accent}</span>
                      {isSelected && (
                        <span className="font-medium text-[#B89A62] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active Preset
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Token Config */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updated = {
                ...(settings.theme_appearance || {}),
                colorBgPrimary: formData.get('colorBgPrimary'),
                colorGold: formData.get('colorGold'),
                colorGoldMuted: formData.get('colorGoldMuted'),
                borderRadiusMode: formData.get('borderRadiusMode'),
                typographyScale: formData.get('typographyScale'),
                enableGrain: formData.get('enableGrain') === 'on',
              };
              handleSaveSetting('theme_appearance', updated);
            }}
            className="space-y-6 pt-6 border-t border-gray-100 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Background */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Primary Background Tone
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="colorBgPrimary"
                    defaultValue={settings.theme_appearance?.colorBgPrimary || '#080C0D'}
                    className="w-9 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={settings.theme_appearance?.colorBgPrimary || '#080C0D'}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Accent Gold */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Antique Accent Gold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="colorGold"
                    defaultValue={settings.theme_appearance?.colorGold || '#B89A62'}
                    className="w-9 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={settings.theme_appearance?.colorGold || '#B89A62'}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Muted Gold */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Muted Gold Hairline
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="colorGoldMuted"
                    defaultValue={settings.theme_appearance?.colorGoldMuted || '#A98B55'}
                    className="w-9 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={settings.theme_appearance?.colorGoldMuted || '#A98B55'}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Corner Geometry (Border Radius)
                </label>
                <select
                  name="borderRadiusMode"
                  defaultValue={settings.theme_appearance?.borderRadiusMode || 'sharp'}
                  className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                >
                  <option value="sharp">Architectural Sharp (0px - 2px) [Recommended]</option>
                  <option value="subtle">Subtle Soft (2px - 4px)</option>
                  <option value="soft">Modern Rounded (4px - 6px)</option>
                </select>
              </div>

              {/* Type Scale */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Editorial Typography Scale
                </label>
                <select
                  name="typographyScale"
                  defaultValue={settings.theme_appearance?.typographyScale || 'editorial'}
                  className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                >
                  <option value="compact">Restrained Classic</option>
                  <option value="editorial">Editorial Haute Parfumerie [Recommended]</option>
                  <option value="grand">Grand Campaign (Extra Bold Displays)</option>
                </select>
              </div>

              {/* Grain Effect */}
              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Atmospheric Grain Texture
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableGrain"
                    defaultChecked={settings.theme_appearance?.enableGrain ?? true}
                    className="rounded border-gray-300 text-[#B89A62] focus:ring-[#B89A62]"
                  />
                  <span className="text-gray-700">Enable subtle film grain texture</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0D1112] text-[#F2EFE8] hover:bg-[#B89A62] hover:text-[#080C0D] transition-all font-semibold tracking-wider uppercase text-xs cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Design Tokens'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENT & OFFERS */}
      {activeTab === 'announcement' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-serif text-[#0D1112]">Announcement Bar &amp; Shipping Banner</h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure top marquee message, complimentary shipping threshold notifications, and promotional incentives.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updated = {
                enabled: formData.get('enabled') === 'on',
                text: formData.get('text'),
                linkText: formData.get('linkText'),
                linkUrl: formData.get('linkUrl'),
                dismissible: formData.get('dismissible') === 'on',
              };
              handleSaveSetting('announcement_bar', updated);
            }}
            className="space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="announcement-enabled"
                  name="enabled"
                  defaultChecked={settings.announcement_bar?.enabled ?? true}
                  className="rounded border-gray-300 text-[#B89A62] focus:ring-[#B89A62]"
                />
                <label htmlFor="announcement-enabled" className="font-semibold text-gray-800 cursor-pointer">
                  Display announcement ribbon on live storefront
                </label>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Announcement Message
                </label>
                <input
                  type="text"
                  name="text"
                  defaultValue={
                    settings.announcement_bar?.text ||
                    'COMPLIMENTARY NATIONWIDE SHIPPING ON RESERVES ABOVE ₹2,500'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Action Link Text (Optional)
                </label>
                <input
                  type="text"
                  name="linkText"
                  defaultValue={settings.announcement_bar?.linkText || 'EXPLORE FLACONS'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                  Action Link URL
                </label>
                <input
                  type="text"
                  name="linkUrl"
                  defaultValue={settings.announcement_bar?.linkUrl || '#curated-section'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0D1112] text-[#F2EFE8] hover:bg-[#B89A62] hover:text-[#080C0D] transition-all font-semibold tracking-wider uppercase text-xs cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Announcement Bar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: EDITORIAL STATEMENTS */}
      {activeTab === 'editorial' && (
        <div className="space-y-6">
          {/* Post-Hero Statement */}
          {(() => {
            const sec = sections.find((s) => s.type === 'editorial_intro');
            const content = sec?.content || {};
            return (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-[#0D1112]">Section 02 — Editorial Brand Statement</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    The quiet luxury post-hero philosophy statement that separates İLLURÊ from generic retail stores.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!sec) return;
                    const formData = new FormData(e.target);
                    handleUpdateSectionData(sec.id, {
                      content: {
                        ...content,
                        eyebrow: formData.get('eyebrow'),
                        statement: formData.get('statement'),
                        body: formData.get('body'),
                        author: formData.get('author'),
                      },
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                      Eyebrow Tag
                    </label>
                    <input
                      type="text"
                      name="eyebrow"
                      defaultValue={content.eyebrow || 'PHILOSOPHY OF CREATION'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                      Main Quote / Statement (Large Serif)
                    </label>
                    <textarea
                      name="statement"
                      rows={2}
                      defaultValue={content.statement || 'Perfume is memory rendered in air. İLLURÊ makes it yours.'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62] font-serif text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                      Supporting Narrative Paragraph
                    </label>
                    <textarea
                      name="body"
                      rows={3}
                      defaultValue={
                        content.body ||
                        'We re-interpret the greatest triumphs of olfactory history. Small format flacons, pure oil concentrations, and immaculate craftsmanship — without the heritage markup.'
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B89A62]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0D1112] text-[#F2EFE8] hover:bg-[#B89A62] hover:text-[#080C0D] text-xs font-semibold uppercase tracking-wider"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Statement</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 6: NAVIGATION & FOOTER */}
      {activeTab === 'navigation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mega Menu Promotion Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div>
              <h2 className="text-base font-serif text-[#0D1112]">Desktop Mega Menu Promotion Card</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Curated campaign feature rendered inside the header navigation flyout.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updated = {
                  ...(settings.mega_menu_nav || {}),
                  featuredBadge: formData.get('featuredBadge'),
                  featuredTitle: formData.get('featuredTitle'),
                  featuredSubtitle: formData.get('featuredSubtitle'),
                  featuredLink: formData.get('featuredLink'),
                  featuredImage: formData.get('featuredImage'),
                };
                handleSaveSetting('mega_menu_nav', updated);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Badge
                </label>
                <input
                  type="text"
                  name="featuredBadge"
                  defaultValue={settings.mega_menu_nav?.featuredBadge || 'HAUTE CONCENTRATION'}
                  className="w-full px-3 py-2 border rounded border-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Headline
                </label>
                <input
                  type="text"
                  name="featuredTitle"
                  defaultValue={settings.mega_menu_nav?.featuredTitle || 'The Niche Extract Edition'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="featuredSubtitle"
                  rows={2}
                  defaultValue={
                    settings.mega_menu_nav?.featuredSubtitle ||
                    '35% oil concentration. Hand-blended in small micro-batches for uncompromised sillage.'
                  }
                  className="w-full px-3 py-2 border rounded border-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Image URL
                </label>
                <input
                  type="text"
                  name="featuredImage"
                  defaultValue={settings.mega_menu_nav?.featuredImage || '/images/oud_wood.jpg'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-mono text-[10px]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0D1112] text-white rounded hover:bg-[#B89A62] text-xs font-semibold uppercase tracking-wider"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Mega Menu Card</span>
              </button>
            </form>
          </div>

          {/* Brand Contacts & Social */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <div>
              <h2 className="text-base font-serif text-[#0D1112]">Brand Channels &amp; Client Concierge</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Configure direct WhatsApp assistance, concierge email, and social networks.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updated = {
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  whatsapp: formData.get('whatsapp'),
                  instagram: formData.get('instagram'),
                };
                handleSaveSetting('brand_contacts', updated);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Concierge Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={settings.brand_contacts?.email || 'concierge@illurefragrance.com'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Phone Assistance
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={settings.brand_contacts?.phone || '+91 98765 43210'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  WhatsApp Concierge Link
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  defaultValue={settings.brand_contacts?.whatsapp || 'https://wa.me/919876543210'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-[10px] uppercase tracking-wider">
                  Instagram Handle URL
                </label>
                <input
                  type="text"
                  name="instagram"
                  defaultValue={settings.brand_contacts?.instagram || 'https://instagram.com/illurefragrance'}
                  className="w-full px-3 py-2 border rounded border-gray-300 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0D1112] text-white rounded hover:bg-[#B89A62] text-xs font-semibold uppercase tracking-wider"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Brand Contacts</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
