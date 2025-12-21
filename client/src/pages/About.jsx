import { useState, useEffect } from 'react';
import { Target, Eye, Award, Users, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/team`);
      const data = await res.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  const values = [
    { icon: Shield, title: 'Security', desc: 'Research protected with industry-standard encryption' },
    { icon: BookOpen, title: 'Accessibility', desc: 'Easy access to nursing research for all authorized users' },
    { icon: Award, title: 'Excellence', desc: 'Promoting quality research and academic integrity' },
    { icon: Users, title: 'Collaboration', desc: 'Fostering a community of researchers and scholars' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          About <span className="text-navy">ConServe</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Preserving excellence in nursing research</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BookOpen className="mr-3 text-navy" size={28} />
          What is ConServe?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          ConServe is the official research repository of Nueva Ecija University of Science and Technology (NEUST) College of Nursing. Our platform serves as a comprehensive digital archive for nursing research papers, theses, and academic publications.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We are committed to preserving, protecting, and promoting academic research excellence by providing a secure, accessible platform that connects researchers, students, and faculty members within the nursing community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-navy text-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-4">
            <Target size={32} className="mr-3" />
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="leading-relaxed">
            To preserve, protect, and promote academic research excellence by providing a secure, accessible platform for nursing research papers, fostering collaboration and advancing nursing science.
          </p>
        </div>

        <div className="bg-accent text-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-4">
            <Eye size={32} className="mr-3" />
            <h2 className="text-2xl font-bold">Our Vision</h2>
          </div>
          <p className="leading-relaxed">
            To be the leading research repository in the Philippines, recognized for excellence in preserving and promoting nursing research that contributes to evidence-based practice and improved healthcare outcomes.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <value.icon className="text-navy" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
          {user?.role === 'admin' && (
            <button onClick={() => window.location.href = '/dashboard?tab=team'} className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 text-sm">
              Manage Team
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No team members added yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member._id} className="text-center group">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-navy to-accent group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                <p className="text-xs text-navy mt-1">NEUST College of Nursing</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Want to Learn More?</h2>
        <p className="mb-6">Get in touch with us for inquiries or support</p>
        <a href="mailto:conserve2025@gmail.com" className="inline-block bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105">
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default About;