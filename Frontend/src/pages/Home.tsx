import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clock,
  TrendingUp,
  Activity,
  ShoppingCart,
  Shield,
  Smartphone,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { testimonials } from '../data/testimonials';

export function Home() {
  const { t, isRTL } = useLanguage();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Activity,
      title: t.features.liveStock.title,
      desc: t.features.liveStock.desc,
    },
    {
      icon: ShoppingCart,
      title: t.features.searchOrder.title,
      desc: t.features.searchOrder.desc,
    },
    {
      icon: Shield,
      title: t.features.secure.title,
      desc: t.features.secure.desc,
    },
    {
      icon: Smartphone,
      title: t.features.easyUi.title,
      desc: t.features.easyUi.desc,
    },
  ];

  const popularMeds = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Insulin',
    'Vitamin D',
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* HERO */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {t.hero.title}
          </h1>

          <div className="w-20 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />

          <p className="text-lg sm:text-xl text-slate-200 mt-8 max-w-2xl mx-auto font-medium">
            {t.hero.subtitle}
          </p>

          <div className="mt-12 max-w-2xl mx-auto">
            <div className="flex bg-white rounded-xl shadow-md overflow-hidden">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                aria-label="Search medication"
                icon={<Search className="h-5 w-5 text-gray-500" />}
                className="h-14 border-none focus:ring-0 text-gray-800 placeholder:text-gray-400"
              />

              <Link
                to={`/search?q=${encodeURIComponent(
                  searchQuery || 'Paracetamol'
                )}`}
              >
                <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 rounded-none font-semibold focus:ring-2 focus:ring-blue-500">
                  {t.hero.cta}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {popularMeds.map((med) => (
                <button
                  key={med}
                  onClick={() => setSearchQuery(med)}
                  className="text-sm text-slate-200 hover:text-white font-medium transition-colors"
                >
                  {med}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">

          {[
            { icon: TrendingUp, value: '30%', label: t.stats.access },
            { icon: Clock, value: '15 min', label: t.stats.time },
            { icon: Activity, value: '20%', label: t.stats.optimization },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-semibold text-blue-600">
                {stat.value}
              </h3>
              <p className="text-gray-700 mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES (DARK CARDS WITH WHITE TEXT) */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t.features.title}
            </h2>
            <p className="text-slate-300 mt-4 font-medium">
              Everything you need for seamless medication access
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                hover
                className="p-6 rounded-2xl bg-slate-800 border border-slate-700 text-white"
              >
                <feature.icon className="h-8 w-8 text-blue-400 mb-4" />

                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12">
            {t.testimonials.title}
          </h2>

          <Card className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100">

            <div className="flex justify-center mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map(
                (_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-amber-500 fill-current"
                  />
                )
              )}
            </div>

            <blockquote className="text-lg text-gray-800 italic leading-relaxed mb-6 font-medium">
              "
              {isRTL
                ? testimonials[currentTestimonial].contentAr
                : testimonials[currentTestimonial].content}
              "
            </blockquote>

            <h4 className="font-semibold text-slate-900">
              {isRTL
                ? testimonials[currentTestimonial].nameAr
                : testimonials[currentTestimonial].name}
            </h4>

            <p className="text-sm text-gray-600 flex items-center justify-center gap-2 mt-1 font-medium">
              <Users className="h-4 w-4" />
              {isRTL
                ? testimonials[currentTestimonial].roleAr
                : testimonials[currentTestimonial].role}
            </p>

            <div className="flex justify-center items-center gap-6 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition"
              >
                {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition"
              >
                {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </div>

          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to improve your healthcare experience?
          </h2>

          <p className="text-slate-200 mb-10 font-medium">
            Find medications instantly or join as a pharmacy partner.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 h-12 font-semibold focus:ring-2 focus:ring-blue-500">
                {t.common.getStarted}
              </Button>
            </Link>

            <Link to="/pharmacies">
              <Button className="bg-white text-slate-900 hover:bg-gray-100 px-8 h-12 font-semibold">
                {t.nav.pharmacies}
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}