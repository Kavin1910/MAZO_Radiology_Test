import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Star, 
  Clock, 
  Users, 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink,
  HelpCircle,
  FileText,
  Video,
  Lightbulb
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

const HelpSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load help articles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  };

  const incrementViewCount = async (articleId: string) => {
    try {
      // Simple view count increment - you could implement this as an RPC function
      const { error } = await supabase
        .from('help_articles')
        .update({ view_count: articles.find(a => a.id === articleId)?.view_count || 0 + 1 })
        .eq('id', articleId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <Lightbulb className="h-4 w-4" />;
      case 'case-management': return <FileText className="h-4 w-4" />;
      case 'analytics': return <BookOpen className="h-4 w-4" />;
      case 'troubleshooting': return <HelpCircle className="h-4 w-4" />;
      case 'billing': return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Articles', count: articles.length },
    { id: 'getting-started', label: 'Getting Started', count: articles.filter(a => a.category === 'getting-started').length },
    { id: 'case-management', label: 'Case Management', count: articles.filter(a => a.category === 'case-management').length },
    { id: 'analytics', label: 'Analytics', count: articles.filter(a => a.category === 'analytics').length },
    { id: 'troubleshooting', label: 'Troubleshooting', count: articles.filter(a => a.category === 'troubleshooting').length },
    { id: 'billing', label: 'Billing', count: articles.filter(a => a.category === 'billing').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <AppHeader variant="dashboard" showAuth={false} />
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
            <p className="text-slate-600">Find answers and get support for Mazo Radiology</p>
          </div>
        </div>

        <Tabs defaultValue="knowledge-base" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="knowledge-base" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="quick-start" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Quick Start</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Contact Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge-base" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search help articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center space-x-2"
                      >
                        {category.id !== 'all' && getCategoryIcon(category.id)}
                        <span>{category.label}</span>
                        <Badge variant="secondary" className="ml-1">{category.count}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Articles */}
            {selectedCategory === 'all' && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Featured Articles</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {articles.filter(article => article.is_featured).map((article) => (
                    <Card key={article.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-900 flex items-start justify-between">
                          <span className="line-clamp-2">{article.title}</span>
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-700 text-sm line-clamp-3 mb-4">
                          {article.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(article.category)}
                            <span className="text-xs text-blue-600 capitalize">
                              {article.category.replace('-', ' ')}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => incrementViewCount(article.id)}
                          >
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {selectedCategory === 'all' ? 'All Articles' : `${categories.find(c => c.id === selectedCategory)?.label} Articles`}
              </h2>
              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading articles...</div>
              ) : filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="bg-white hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                              {getCategoryIcon(article.category)}
                              <span>{article.title}</span>
                              {article.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                            </h3>
                            <p className="text-slate-600 mb-4 line-clamp-2">{article.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{article.view_count} views</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => incrementViewCount(article.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        {article.tags.length > 0 && (
                          <div className="flex gap-2 mt-4">
                            {article.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  No articles found. Try adjusting your search or filter.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quick-start" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-green-600" />
                  <span>Quick Start Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Getting Started Checklist</h3>
                    <div className="space-y-2">
                      {[
                        'Complete your profile setup',
                        'Configure notification preferences',
                        'Upload your first medical image',
                        'Review AI-generated findings',
                        'Explore the analytics dashboard',
                        'Set up your workflow preferences'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Key Features</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">AI-Powered Prioritization</h4>
                        <p className="text-sm text-blue-700">Automatically prioritize cases based on urgency</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Real-time Analytics</h4>
                        <p className="text-sm text-green-700">Monitor performance and productivity metrics</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Collaborative Workflow</h4>
                        <p className="text-sm text-purple-700">Share findings and collaborate with colleagues</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span>Technical Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    Get technical assistance with platform issues, bugs, or integration problems.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">support@mazoradiology.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">24/7 Support Available</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    Open Support Ticket
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Sales & Billing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    Questions about pricing, billing, or upgrading your plan? Our sales team is here to help.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">sales@mazoradiology.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">+1 (555) 987-6543</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Mon-Fri, 9 AM - 6 PM EST</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Emergency Support</h3>
                  <p className="text-blue-700">
                    For critical system issues affecting patient care, call our emergency hotline immediately.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-blue-900">
                    <Phone className="h-5 w-5" />
                    <span>+1 (555) 911-HELP</span>
                  </div>
                  <p className="text-sm text-blue-600">Available 24/7 for emergency situations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpSupport;